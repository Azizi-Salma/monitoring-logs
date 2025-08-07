<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private JWTTokenManagerInterface $JWTTokenManager,
        private UserPasswordHasherInterface $passwordHasher,
        private UserRepository $userRepository
    ) {}

    /**
     * Endpoint de connexion JWT
     * Cette méthode sera appelée après une authentification réussie
     */
    #[Route('/login_check', name: 'api_login_check', methods: ['POST'])]
    public function loginCheck(): JsonResponse
    {
        // Cette méthode ne sera jamais exécutée car interceptée par le firewall JWT
        // Elle sert juste à documenter l'endpoint
        throw new \LogicException('This method should never be reached');
    }

    /**
     * Obtenir les informations de l'utilisateur connecté
     */
    #[Route('/user/profile', name: 'api_user_profile', methods: ['GET'])]
    public function getCurrentUser(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        return $this->json([
            'user' => $this->serializer->serialize($user, 'json', ['groups' => ['user:read']])
        ]);
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    #[Route('/user/profile', name: 'api_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request, #[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $user->setName($data['name']);
        }

        if (isset($data['department'])) {
            $user->setDepartment($data['department']);
        }

        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        // Changer le mot de passe si fourni
        if (isset($data['currentPassword']) && isset($data['newPassword'])) {
            if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
                return $this->json(['message' => 'Mot de passe actuel incorrect'], 400);
            }

            if (strlen($data['newPassword']) < 6) {
                return $this->json(['message' => 'Le nouveau mot de passe doit contenir au moins 6 caractères'], 400);
            }

            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
            $user->setPassword($hashedPassword);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => json_decode($this->serializer->serialize($user, 'json', ['groups' => ['user:read']]))
        ]);
    }

    /**
     * Rafraîchir le token JWT
     */
    #[Route('/token/refresh', name: 'api_token_refresh', methods: ['POST'])]
    public function refreshToken(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        // Mettre à jour la dernière connexion
        $user->updateLastLogin();
        $this->entityManager->flush();

        // Générer un nouveau token
        $token = $this->JWTTokenManager->create($user);

        return $this->json([
            'token' => $token,
            'user' => json_decode($this->serializer->serialize($user, 'json', ['groups' => ['user:read']]))
        ]);
    }

    /**
     * Endpoint pour créer des utilisateurs de test (à supprimer en production)
     */
    #[Route('/create-test-users', name: 'api_create_test_users', methods: ['POST'])]
    public function createTestUsers(): JsonResponse
    {
        // Vérifier si les utilisateurs existent déjà
        $adminExists = $this->userRepository->findOneBy(['email' => 'admin@example.com']);
        $userExists = $this->userRepository->findOneBy(['email' => 'user1@example.com']);

        if ($adminExists && $userExists) {
            return $this->json(['message' => 'Les utilisateurs de test existent déjà'], 400);
        }

        $users = [];

        // Créer l'administrateur
        if (!$adminExists) {
            $admin = new User();
            $admin->setEmail('admin@example.com')
                  ->setName('Administrateur')
                  ->setRoles(['ROLE_ADMIN'])
                  ->setDepartment('IT')
                  ->setPhone('+212 5 99 12 34 56')
                  ->setPassword($this->passwordHasher->hashPassword($admin, 'secret1234'));

            $this->entityManager->persist($admin);
            $users[] = $admin;
        }

        // Créer l'utilisateur standard
        if (!$userExists) {
            $user = new User();
            $user->setEmail('user1@example.com')
                 ->setName('Utilisateur Test')
                 ->setRoles(['ROLE_USER'])
                 ->setDepartment('Support')
                 ->setPhone('+212 5 98 76 54 32')
                 ->setPassword($this->passwordHasher->hashPassword($user, 'password1234'));

            $this->entityManager->persist($user);
            $users[] = $user;
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Utilisateurs de test créés avec succès',
            'users' => [
                ['email' => 'admin@example.com', 'password' => 'secret1234', 'role' => 'ADMIN'],
                ['email' => 'user1@example.com', 'password' => 'password1234', 'role' => 'USER']
            ]
        ]);
    }

    /**
     * Obtenir les statistiques d'authentification (admin seulement)
     */
    #[Route('/auth/stats', name: 'api_auth_stats', methods: ['GET'])]
    public function getAuthStats(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $totalUsers = $this->userRepository->count([]);
        $activeUsers = $this->userRepository->count(['isActive' => true]);
        $adminUsers = $this->userRepository->countByRole('ROLE_ADMIN');

        // Utilisateurs connectés dans les dernières 24h
        $yesterday = new \DateTime('-1 day');
        $recentLogins = $this->userRepository->countRecentLogins($yesterday);

        // Nouveaux utilisateurs ce mois
        $startOfMonth = new \DateTime('first day of this month midnight');
        $newUsersThisMonth = $this->userRepository->countNewUsers($startOfMonth);

        return $this->json([
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'adminUsers' => $adminUsers,
                'recentLogins' => $recentLogins,
                'newUsersThisMonth' => $newUsersThisMonth,
                'inactiveUsers' => $totalUsers - $activeUsers
            ]
        ]);
    }

    /**
     * Changer le statut d'un utilisateur (admin seulement)
     */
    #[Route('/users/{id}/toggle-status', name: 'api_toggle_user_status', methods: ['PATCH'])]
    public function toggleUserStatus(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Empêcher la désactivation de son propre compte
        if ($user === $this->getUser()) {
            return $this->json(['message' => 'Vous ne pouvez pas désactiver votre propre compte'], 400);
        }

        $user->setIsActive(!$user->isActive());
        $this->entityManager->flush();

        return $this->json([
            'message' => sprintf('Utilisateur %s avec succès', $user->isActive() ? 'activé' : 'désactivé'),
            'user' => json_decode($this->serializer->serialize($user, 'json', ['groups' => ['user:read']]))
        ]);
    }
}
