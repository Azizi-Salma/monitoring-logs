<?php

namespace App\Service;

use App\Entity\Log;
use App\Repository\LogRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Psr\Log\LoggerInterface;

class LogService
{
    public function __construct(
        private readonly LogRepository $logRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly RequestStack $requestStack,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly AuthorizationCheckerInterface $authChecker,
        private readonly LoggerInterface $logger
    ) {}

    public function createLog(
        string $level,
        string $message,
        array $context = [],
        ?string $channel = 'app',
        ?string $source = null
    ): Log {
        $log = new Log();
        $log->setLevel($level);
        $log->setMessage($message);
        $log->setContext($context);
        $log->setChannel($channel);
        $log->setSource($source ?? $this->getCurrentUserEmail());
        $log->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($log);
        $this->entityManager->flush();

        return $log;
    }

    // Méthodes principales avec préfixe 'log'
    public function logDebug(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->createLog(Log::LEVEL_DEBUG, $message, $context, 'app', $source);
    }

    public function logInfo(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->createLog(Log::LEVEL_INFO, $message, $context, 'app', $source);
    }

    public function logWarning(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->createLog(Log::LEVEL_WARNING, $message, $context, 'app', $source);
    }

    public function logError(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->createLog(Log::LEVEL_ERROR, $message, $context, 'app', $source);
    }

    public function logCritical(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->createLog(Log::LEVEL_CRITICAL, $message, $context, 'app', $source);
    }

    // Alias pratiques sans préfixe pour compatibilité
    public function debug(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->logDebug($message, $context, $source);
    }

    public function info(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->logInfo($message, $context, $source);
    }

    public function warning(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->logWarning($message, $context, $source);
    }

    public function error(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->logError($message, $context, $source);
    }

    public function critical(string $message, array $context = [], ?string $source = null): Log
    {
        return $this->logCritical($message, $context, $source);
    }

    public function archiveOldLogs(int $daysToKeep = 30): int
    {
        $dateLimit = new \DateTimeImmutable("-$daysToKeep days");

        $logsToArchive = $this->logRepository->createQueryBuilder('l')
            ->where('l.createdAt < :date')
            ->setParameter('date', $dateLimit)
            ->getQuery()
            ->getResult();

        foreach ($logsToArchive as $log) {
            $this->entityManager->remove($log);
        }

        $this->entityManager->flush();

        $deletedCount = count($logsToArchive);

        $this->logInfo("Archived {$deletedCount} old logs", [
            'days_to_keep' => $daysToKeep,
            'deleted_count' => $deletedCount,
        ], 'LogService');

        return $deletedCount;
    }

    public function getCurrentUserEmail(): ?string
    {
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : null;

        return is_object($user) && method_exists($user, 'getUserIdentifier')
            ? $user->getUserIdentifier()
            : null;
    }

    public function bulkDelete(array $logIds): int
    {
        $deletedCount = 0;

        foreach ($logIds as $id) {
            $log = $this->logRepository->find($id);
            if ($log) {
                $this->entityManager->remove($log);
                $deletedCount++;
            }
        }

        $this->entityManager->flush();

        $this->logInfo("Bulk deleted {$deletedCount} logs", [
            'deleted_ids' => $logIds,
        ], 'LogService');

        return $deletedCount;
    }

    public function analyzeLogs(): array
    {
        $logs = $this->logRepository->findAll();

        $summary = [
            Log::LEVEL_DEBUG => 0,
            Log::LEVEL_INFO => 0,
            Log::LEVEL_WARNING => 0,
            Log::LEVEL_ERROR => 0,
            Log::LEVEL_CRITICAL => 0,
        ];

        foreach ($logs as $log) {
            $level = $log->getLevel();
            if (isset($summary[$level])) {
                $summary[$level]++;
            }
        }

        return $summary;
    }
}
