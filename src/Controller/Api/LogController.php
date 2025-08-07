<?php
namespace App\Controller\Api;

use App\Repository\LogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request; 
use Symfony\Component\Routing\Annotation\Route;

class LogController extends AbstractController
{
    #[Route('/logs', name: 'api_logs', methods: ['GET'])]
    public function getLogs(LogRepository $logRepository, Request $request): JsonResponse
    {
        // 1. Récupérer les paramètres de requête standards
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = min(100, max(1, (int)$request->query->get('limit', 10)));

        // 2. ---  Vérifier le paramètre 'export' ---
        $isExport = $request->query->getBoolean('export');

        // Récupérer les filtres 
        $filters = [
            'level' => $request->query->get('level'),
            'search' => $request->query->get('search'),
            'date_from' => $request->query->get('dateFrom'), // Adaptation du nom
            'date_to' => $request->query->get('dateTo'),   // Adaptation du nom
        ];

        // 3. --- Branchement logique ---
        if ($isExport) {
            // --- CAS D'EXPORT : Récupérer tous les logs sans pagination ---
            $veryLargeLimit = 1000000; // Limite arbitrairement grande
            
            // ---  Compter puis récupérer tous ---
            $totalItemsForExport = $logRepository->countWithFilters($filters);
            $logs = $logRepository->findWithFilters($filters, 1, $totalItemsForExport);
            
            // Pour la pagination dans la réponse 
            $totalItems = $totalItemsForExport;
            $totalPages = 1; 

        } else {
            // --- CAS NORMAL : Pagination ---
            $logs = $logRepository->findWithFilters($filters, $page, $limit);
            $totalItems = $logRepository->countWithFilters($filters);
            $totalPages = ceil($totalItems / $limit);
        }
        // 4. Sérialiser les logs
        $serializedLogs = array_map(fn($log) => $log->jsonSerialize(), $logs);

        // 5. Renvoyer la réponse JSON
        return $this->json([
            'data' => $serializedLogs,
            'pagination' => [
                'currentPage' => $page,
                'itemsPerPage' => $isExport ? $totalItems : $limit, 
                'totalItems' => $totalItems,
                'totalPages' => $totalPages,
            ]
        ]);
    }
}
?>