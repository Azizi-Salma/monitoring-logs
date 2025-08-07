<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AbstractController
{
    public function index(): Response
    {
        return $this->json([
            'message' => 'API Log Monitoring System',
            'version' => '1.0.0',
            'endpoints' => [
                'POST /api/login' => 'Authentication',
                'POST /api/register' => 'User Registration',
                'GET /api/logs' => 'Get logs',
                'GET /api/users' => 'Get users (admin only)',
                'POST /api/users' => 'Create user (admin only)'
            ],
            'status' => 'running'
        ]);
    }
}