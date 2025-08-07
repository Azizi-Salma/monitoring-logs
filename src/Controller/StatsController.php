<?php
// src/Controller/StatsController.php

namespace App\Controller;

use App\Repository\LogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class StatsController extends AbstractController
{
    #[Route('/api/stats', name: 'api_stats', methods: ['GET'])]
    public function stats(LogRepository $logRepository): JsonResponse
    {
        // --- 1. Définir la période pour les statistiques ---
        // Les 30 derniers jours (correspond au défaut de LogRepository::getStatistics)
        $endDate = new \DateTimeImmutable();
        $startDate = $endDate->modify('-30 days');

        // --- 2. Récupérer les statistiques agrégées depuis le repository ---
        $stats = $logRepository->getStatistics($startDate, $endDate);
        $totalLogs = $stats['total'];

        // --- 3. Calculer les logs d'aujourd'hui (dernières 24h) ---
        $yesterday = new \DateTimeImmutable('-24 hours');
        $todayLogs = $logRepository->countWithFilters([
            'date_from' => $yesterday->format('Y-m-d H:i:s'),
        ]);

        // --- 4. Calculer le taux d'erreur (sur la période définie ci-dessus, 30j) ---
        // Utiliser la même période que getStatistics pour cohérence
        $errorCountPeriod = array_sum(
            array_column(
                array_filter(
                    $stats['levels'],
                    fn($levelStat) => in_array(strtolower($levelStat['level']), ['error', 'critical'])
                ),
                'count'
            )
        );

        $errorRate = 0;
        if ($totalLogs > 0) {
            // Correction: Assurons-nous que todayLogs ne dépasse pas totalLogs.
            // Cependant, le calcul ici est sur une période différente (24h vs 30j).
            // Si le problème persiste, il faut vérifier la logique dans countWithFilters.
            $errorRate = round(($errorCountPeriod / $totalLogs) * 100, 2);
        }

        // --- 5. Calculer la santé du système (simplifié) ---
        $systemHealth = max(0, 100 - $errorRate); // Garantit un minimum de 0

        // --- 6. Préparer les données pour le graphique par niveau ---
        $logLevelData = array_map(fn($levelStat) => [
            'name' => strtoupper($levelStat['level']), // Mettre en majuscules si souhaité
            'value' => (int)$levelStat['count'],
            'color' => match (strtoupper($levelStat['level'])) {
                'ERROR', 'CRITICAL' => '#f44336',
                'WARNING' => '#ff9800',
                'INFO' => '#2196f3',
                'DEBUG' => '#9e9e9e',
                default => '#90a4ae', // Gris par défaut
            }
        ], $stats['levels']);

        // --- 7. CORRECTION: Préparer les données pour le graphique de tendance ---
        // Transformer les données brutes fournies par getStatistics()['daily']
        // du format [{ date: 'YYYY-MM-DD', count: N }, ...]
        // au format attendu par le frontend [{ time: 'DD/MM', logs: N }, ...]
        $logTrendData = [];

        if (is_array($stats['daily']) && !empty($stats['daily'])) {
            foreach ($stats['daily'] as $dailyStat) {
                // Vérifier que les clés attendues existent
                if (isset($dailyStat['date']) && isset($dailyStat['count'])) {
                    // Créer un objet DateTime à partir de la chaîne de date
                    $dateObj = \DateTime::createFromFormat('Y-m-d', $dailyStat['date']);
                    if ($dateObj) {
                        // Formater la date pour l'affichage sur l'axe X du graphique (DD/MM)
                        $formattedTime = $dateObj->format('d/m');
                    } else {
                        // En cas d'erreur de parsing, utiliser la date brute
                        $formattedTime = $dailyStat['date'];
                    }

                    $logTrendData[] = [
                        'time' => $formattedTime,
                        'logs' => (int)$dailyStat['count'],
                        // Si getStatistics fournissait info/warning/error séparés, on les utiliserait ici
                        // 'info' => ..., 'warnings' => ..., 'errors' => ...
                    ];
                }
                // Si le format n'est pas reconnu pour cet élément, on le saute
            }
        }
        // Si $stats['daily'] est vide ou mal formé, $logTrendData reste un tableau vide []

        // --- 8. Préparer les métriques système (données fictives fixes ou à implémenter) ---
        $systemMetrics = [
            ['name' => 'CPU', 'value' => random_int(30, 80), 'color' => '#2196f3'], // Bleu
            ['name' => 'Mémoire', 'value' => random_int(40, 90), 'color' => '#4caf50'], // Vert
            ['name' => 'Disque', 'value' => random_int(50, 95), 'color' => '#ff9800'], // Orange
        ];

        // --- 9. Renvoyer la réponse JSON ---
        return $this->json([
            'totalLogs' => $totalLogs,
            'todayLogs' => $todayLogs, // Doit être <= totalLogs si la période est cohérente
            'errorRate' => $errorRate,
            'systemHealth' => $systemHealth,
            'logLevelData' => $logLevelData,
            'logTrendData' => $logTrendData, // Format CORRIGE ici
            'systemMetrics' => $systemMetrics,
            'lastUpdate' => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM), // Horodatage ISO 8601
        ]);
    }
}