<?php

namespace App\Repository;

use App\Entity\Log;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Log>
 */
class LogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Log::class);
    }

    public function save(Log $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Log $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find logs with filters and pagination
     */
    public function findWithFilters(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $qb = $this->createFilteredQuery($filters);
        
        $offset = ($page - 1) * $limit;
        $qb->setFirstResult($offset)
           ->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    /**
     * Count logs with filters
     */
    public function countWithFilters(array $filters = []): int
    {
        $qb = $this->createFilteredQuery($filters);
        $qb->select('COUNT(l.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Create filtered query builder
     */
    private function createFilteredQuery(array $filters = []): QueryBuilder
    {
        $qb = $this->createQueryBuilder('l')
            ->leftJoin('l.user', 'u')
            ->addSelect('u')
            ->orderBy('l.createdAt', 'DESC');

        // Filter by level
        if (!empty($filters['level'])) {
            if (is_array($filters['level'])) {
                $qb->andWhere('l.level IN (:levels)')
                   ->setParameter('levels', $filters['level']);
            } else {
                $qb->andWhere('l.level = :level')
                   ->setParameter('level', $filters['level']);
            }
        }

        // Filter by channel
        if (!empty($filters['channel'])) {
            $qb->andWhere('l.channel = :channel')
               ->setParameter('channel', $filters['channel']);
        }

        // Filter by source
        if (!empty($filters['source'])) {
            $qb->andWhere('l.source LIKE :source')
               ->setParameter('source', '%' . $filters['source'] . '%');
        }

        // Filter by user
        if (!empty($filters['user_id'])) {
            $qb->andWhere('l.user = :user_id')
               ->setParameter('user_id', $filters['user_id']);
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $qb->andWhere('l.createdAt >= :date_from')
               ->setParameter('date_from', new \DateTimeImmutable($filters['date_from']));
        }

        if (!empty($filters['date_to'])) {
            $dateTo = new \DateTimeImmutable($filters['date_to']);
            $dateTo = $dateTo->setTime(23, 59, 59);
            $qb->andWhere('l.createdAt <= :date_to')
               ->setParameter('date_to', $dateTo);
        }

        // Search in message
        if (!empty($filters['search'])) {
            $qb->andWhere('l.message LIKE :search OR l.source LIKE :search')
               ->setParameter('search', '%' . $filters['search'] . '%');
        }

        // Filter by IP address
        if (!empty($filters['ip_address'])) {
            $qb->andWhere('l.ipAddress = :ip_address')
               ->setParameter('ip_address', $filters['ip_address']);
        }

        return $qb;
    }

    /**
     * Get log statistics
     */
    public function getStatistics(\DateTimeImmutable $from = null, \DateTimeImmutable $to = null): array
    {
        $from = $from ?? new \DateTimeImmutable('-30 days');
        $to = $to ?? new \DateTimeImmutable();

        // Stats by level
        $levelStats = $this->createQueryBuilder('l')
            ->select('l.level, COUNT(l.id) as count')
            ->where('l.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('l.level')
            ->getQuery()
            ->getResult();

        // Stats by channel
        $channelStats = $this->createQueryBuilder('l')
            ->select('l.channel, COUNT(l.id) as count')
            ->where('l.createdAt BETWEEN :from AND :to')
            ->andWhere('l.channel IS NOT NULL')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('l.channel')
            ->orderBy('count', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        // Daily stats (last 30 days)
        $dailyStats = $this->createQueryBuilder('l')
            ->select("DATE(l.createdAt) as date, COUNT(l.id) as count")
            ->where('l.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->getQuery()
            ->getResult();

        return [
            'levels' => $levelStats,
            'channels' => $channelStats,
            'daily' => $dailyStats,
            'total' => array_sum(array_column($levelStats, 'count')),
        ];
    }

    /**
     * Get recent error logs
     */
    public function getRecentErrors(int $limit = 10): array
    {
        return $this->createQueryBuilder('l')
            ->leftJoin('l.user', 'u')
            ->addSelect('u')
            ->where('l.level IN (:error_levels)')
            ->setParameter('error_levels', [Log::LEVEL_ERROR, Log::LEVEL_CRITICAL])
            ->orderBy('l.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Get unique channels
     */
    public function getUniqueChannels(): array
    {
        $result = $this->createQueryBuilder('l')
            ->select('DISTINCT l.channel')
            ->where('l.channel IS NOT NULL')
            ->orderBy('l.channel', 'ASC')
            ->getQuery()
            ->getScalarResult();

        return array_column($result, 'channel');
    }

    /**
     * Get unique sources
     */
    public function getUniqueSources(): array
    {
        $result = $this->createQueryBuilder('l')
            ->select('DISTINCT l.source')
            ->where('l.source IS NOT NULL')
            ->orderBy('l.source', 'ASC')
            ->setMaxResults(50)
            ->getQuery()
            ->getScalarResult();

        return array_column($result, 'source');
    }

    /**
     * Clean old logs
     */
    public function cleanOldLogs(int $daysToKeep = 90): int
    {
        $date = new \DateTimeImmutable(sprintf('-%d days', $daysToKeep));
        
        return $this->createQueryBuilder('l')
            ->delete()
            ->where('l.createdAt < :date')
            ->setParameter('date', $date)
            ->getQuery()
            ->execute();
    }

    /**
     * Get logs by user
     */
    public function findByUser(User $user, int $limit = 100): array
    {
        return $this->createQueryBuilder('l')
            ->where('l.user = :user')
            ->setParameter('user', $user)
            ->orderBy('l.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Get error count for dashboard
     */
    public function getErrorCount(\DateTimeImmutable $since = null): int
    {
        $since = $since ?? new \DateTimeImmutable('-24 hours');

        return (int) $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->where('l.level IN (:error_levels)')
            ->andWhere('l.createdAt >= :since')
            ->setParameter('error_levels', [Log::LEVEL_ERROR, Log::LEVEL_CRITICAL])
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
