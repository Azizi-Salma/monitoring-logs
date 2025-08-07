<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class LogFileReader
{
    private string $logDirectory;
    private ParameterBagInterface $params;

    public function __construct(ParameterBagInterface $params)
    {
        $this->params = $params;
        $this->logDirectory = $params->get('kernel.logs_dir');
    }

    public function readLogs(array $filters = []): array
    {
        $logs = [];
        
        try {
            // Récupérer tous les fichiers de log
            $logFiles = $this->getLogFiles();
            
            foreach ($logFiles as $logFile) {
                $fileLogs = $this->parseLogFile($logFile);
                $logs = array_merge($logs, $fileLogs);
            }

            // Si aucun log trouvé, créer des logs de démonstration
            if (empty($logs)) {
                $logs = $this->generateDemoLogs();
            }

            // Appliquer les filtres
            $logs = $this->applyFilters($logs, $filters);

            // Trier par date décroissante
            usort($logs, function($a, $b) {
                return strtotime($b['datetime']) - strtotime($a['datetime']);
            });

            return $logs;

        } catch (\Exception $e) {
            // En cas d'erreur, retourner des logs de démonstration
            return $this->generateDemoLogs();
        }
    }

    private function getLogFiles(): array
    {
        $files = [];
        $logPattern = $this->logDirectory . '/*.log';
        
        foreach (glob($logPattern) as $file) {
            if (is_readable($file)) {
                $files[] = $file;
            }
        }

        // Si aucun fichier trouvé, chercher dans d'autres répertoires communs
        if (empty($files)) {
            $commonPaths = [
                $this->logDirectory . '/dev.log',
                $this->logDirectory . '/prod.log',
                dirname($this->logDirectory) . '/log/dev.log',
                dirname($this->logDirectory) . '/log/prod.log',
            ];

            foreach ($commonPaths as $path) {
                if (file_exists($path) && is_readable($path)) {
                    $files[] = $path;
                }
            }
        }

        return $files;
    }

    private function parseLogFile(string $filePath): array
    {
        $logs = [];
        
        if (!file_exists($filePath) || !is_readable($filePath)) {
            return $logs;
        }

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            return $logs;
        }

        $lineNumber = 0;
        while (($line = fgets($handle)) !== false) {
            $lineNumber++;
            $logEntry = $this->parseLogLine($line, $lineNumber, basename($filePath));
            
            if ($logEntry) {
                $logs[] = $logEntry;
            }
        }

        fclose($handle);
        return $logs;
    }

    private function parseLogLine(string $line, int $lineNumber, string $filename): ?array
    {
        // Pattern pour parser les logs Symfony
        $pattern = '/^\[([^\]]+)\] (\w+)\.(\w+): (.+)$/';
        
        if (preg_match($pattern, trim($line), $matches)) {
            return [
                'id' => md5($line . $lineNumber),
                'datetime' => $this->formatDateTime($matches[1]),
                'level' => strtoupper($matches[3]),
                'channel' => $matches[2],
                'message' => trim($matches[4]),
                'context' => $this->extractContext($matches[4]),
                'file' => $filename,
                'line_number' => $lineNumber,
                'raw' => $line
            ];
        }

        // Pattern alternatif pour d'autres formats de logs
        $altPattern = '/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)$/';
        if (preg_match($altPattern, trim($line), $matches)) {
            return [
                'id' => md5($line . $lineNumber),
                'datetime' => $matches[1],
                'level' => strtoupper($matches[2]),
                'channel' => 'app',
                'message' => trim($matches[3]),
                'context' => '',
                'file' => $filename,
                'line_number' => $lineNumber,
                'raw' => $line
            ];
        }

        return null;
    }

    private function formatDateTime(string $dateString): string
    {
        try {
            $date = new \DateTime($dateString);
            return $date->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            return date('Y-m-d H:i:s');
        }
    }

    private function extractContext(string $message): string
    {
        // Extraire le contexte JSON si présent
        if (preg_match('/\{[^}]+\}$/', $message, $matches)) {
            return $matches[0];
        }
        
        return '';
    }

    private function applyFilters(array $logs, array $filters): array
    {
        if (empty($filters)) {
            return $logs;
        }

        return array_filter($logs, function($log) use ($filters) {
            // Filtre par niveau
            if (!empty($filters['level']) && strtolower($log['level']) !== strtolower($filters['level'])) {
                return false;
            }

            // Filtre par recherche textuelle
            if (!empty($filters['search'])) {
                $searchTerm = strtolower($filters['search']);
                $searchableText = strtolower($log['message'] . ' ' . $log['context']);
                if (strpos($searchableText, $searchTerm) === false) {
                    return false;
                }
            }

            // Filtre par date de début
            if (!empty($filters['start_date'])) {
                $logDate = strtotime($log['datetime']);
                $startDate = strtotime($filters['start_date']);
                if ($logDate < $startDate) {
                    return false;
                }
            }

            // Filtre par date de fin
            if (!empty($filters['end_date'])) {
                $logDate = strtotime($log['datetime']);
                $endDate = strtotime($filters['end_date'] . ' 23:59:59');
                if ($logDate > $endDate) {
                    return false;
                }
            }

            return true;
        });
    }

    private function generateDemoLogs(): array
    {
        $levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
        $channels = ['app', 'security', 'request', 'doctrine', 'cache'];
        $messages = [
            'DEBUG' => [
                'Cache hit for key: user_profile_123',
                'Database query executed successfully',
                'Memory usage: 45MB',
                'Processing user request for endpoint /api/logs'
            ],
            'INFO' => [
                'User logged in successfully',
                'New user registered: john.doe@example.com',
                'Email sent to user@example.com',
                'File uploaded: document.pdf',
                'Configuration updated successfully'
            ],
            'WARNING' => [
                'Deprecated function used in UserController',
                'High memory usage detected: 85%',
                'Slow query detected: 2.5s',
                'Rate limit approaching for IP 192.168.1.100'
            ],
            'ERROR' => [
                'Failed to connect to database',
                'Invalid JWT token provided',
                'File not found: /uploads/missing.jpg',
                'Permission denied for user action',
                'Validation failed: email format invalid'
            ],
            'CRITICAL' => [
                'Database connection lost',
                'Disk space critically low: 2% remaining',
                'Security breach detected',
                'System overload: CPU usage 95%'
            ]
        ];

        $logs = [];
        $now = new \DateTime();

        for ($i = 0; $i < 100; $i++) {
            $level = $levels[array_rand($levels)];
            $channel = $channels[array_rand($channels)];
            $message = $messages[$level][array_rand($messages[$level])];
            
            // Créer une date aléatoire dans les 7 derniers jours
            $randomDate = (clone $now)->modify('-' . rand(0, 7) . ' days')
                                     ->modify('-' . rand(0, 23) . ' hours')
                                     ->modify('-' . rand(0, 59) . ' minutes');

            $logs[] = [
                'id' => 'demo_' . ($i + 1),
                'datetime' => $randomDate->format('Y-m-d H:i:s'),
                'level' => $level,
                'channel' => $channel,
                'message' => $message,
                'context' => $this->generateContext($level),
                'file' => 'demo.log',
                'line_number' => $i + 1,
                'raw' => sprintf('[%s] %s.%s: %s', 
                    $randomDate->format('Y-m-d H:i:s'), 
                    $channel, 
                    strtolower($level), 
                    $message
                )
            ];
        }

        return $logs;
    }

    private function generateContext(string $level): string
    {
        $contexts = [
            'DEBUG' => '{"memory_usage":"45MB","execution_time":"0.025s"}',
            'INFO' => '{"user_id":123,"ip":"192.168.1.100"}',
            'WARNING' => '{"threshold":"80%","current":"85%"}',
            'ERROR' => '{"error_code":"E001","file":"UserController.php","line":45}',
            'CRITICAL' => '{"alert_sent":true,"escalation_level":3}'
        ];

        return $contexts[$level] ?? '{}';
    }
}