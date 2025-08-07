<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Créer un utilisateur avec email, login, password, prénom, nom et rôle'
)]
class CreateUserCommand extends Command
{
    private $em;
    private $passwordHasher;

    public function __construct(EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher)
    {
        parent::__construct();
        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email de l\'utilisateur')
            ->addArgument('login', InputArgument::REQUIRED, 'Login de l\'utilisateur')
            ->addArgument('password', InputArgument::REQUIRED, 'Mot de passe')
            ->addArgument('firstName', InputArgument::REQUIRED, 'Prénom de l\'utilisateur')
            ->addArgument('lastName', InputArgument::REQUIRED, 'Nom de famille de l\'utilisateur')
            ->addArgument('role', InputArgument::REQUIRED, 'Rôle (ROLE_USER ou ROLE_ADMIN)');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $email = $input->getArgument('email');
        $login = $input->getArgument('login');
        $password = $input->getArgument('password');
        $firstName = $input->getArgument('firstName');
        $lastName = $input->getArgument('lastName');
        $role = $input->getArgument('role');

        // Vérification unicité
        if ($this->em->getRepository(User::class)->findOneBy(['email' => $email])) {
            $output->writeln(" Un utilisateur avec cet email existe déjà.");
            return Command::FAILURE;
        }

        if ($this->em->getRepository(User::class)->findOneBy(['login' => $login])) {
            $output->writeln(" Un utilisateur avec ce login existe déjà.");
            return Command::FAILURE;
        }

        $user = new User();
        $user->setEmail($email);
        $user->setLogin($login);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setRoles([$role]);

        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $this->em->persist($user);
        $this->em->flush();

        $output->writeln(" Utilisateur '{$login}' avec le rôle '{$role}' créé avec succès.");

        return Command::SUCCESS;
    }
}
