<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    public function save(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find users with filters and pagination.
     * 
     * @param array $filters
     * @param int $page
     * @param int $limit
     * @return User[]
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
     * Count users with filters.
     * 
     * @param array $filters
     * @return int
     */
    public function countWithFilters(array $filters = []): int
    {
        $qb = $this->createFilteredQuery($filters);
        $qb->select('COUNT(u.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Create query builder with applied filters.
     * 
     * @param array $filters
     * @return QueryBuilder
     */
    private function createFilteredQuery(array $filters = []): QueryBuilder
    {
        $qb = $this->createQueryBuilder('u');

        if (!empty($filters['email'])) {
            $qb->andWhere('u.email LIKE :email')
               ->setParameter('email', '%' . $filters['email'] . '%');
        }

        if (!empty($filters['role'])) {
            $qb->andWhere('u.roles LIKE :role')
               ->setParameter('role', '%' . $filters['role'] . '%');
        }

        if (!empty($filters['created_after'])) {
            $qb->andWhere('u.createdAt >= :createdAfter')
               ->setParameter('createdAfter', $filters['created_after']);
        }

        if (!empty($filters['created_before'])) {
            $qb->andWhere('u.createdAt <= :createdBefore')
               ->setParameter('createdBefore', $filters['created_before']);
        }

        // Order by email asc by default 
        $qb->orderBy('u.email', 'ASC');

        return $qb;
    }
}
