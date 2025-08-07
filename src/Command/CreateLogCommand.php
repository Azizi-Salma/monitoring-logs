<?php

namespace App\Command;

use App\Entity\Log;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateLogCommand extends Command
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct();
        $this->em = $em;
    }

    protected function configure(): void
    {
        $this
            ->setName('app:create-log')
            ->setDescription('Créer un log personnalisé.')
            ->addOption('message', null, InputOption::VALUE_REQUIRED, 'Message du log')
            ->addOption('level', null, InputOption::VALUE_OPTIONAL, 'Niveau du log', 'INFO')
            ->addOption('channel', null, InputOption::VALUE_OPTIONAL, 'Canal du log', 'system')
            ->addOption('source', null, InputOption::VALUE_OPTIONAL, 'Source du log', 'console')
            ->addOption('user', null, InputOption::VALUE_OPTIONAL, 'Utilisateur', 'admin');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $message = $input->getOption('message');
        $level = $input->getOption('level');
        $channel = $input->getOption('channel');
        $source = $input->getOption('source');
        $user = $input->getOption('user');

        if (!$message) {
            $output->writeln('<error>Le message est requis (--message)</error>');
            return Command::FAILURE;
        }

        $log = new Log();
        $log->setCreatedAt(new \DateTime());
        $log->setLevel($level);
        $log->setMessage($message);
        $log->setChannel($channel);
        $log->setContext(['user' => $user]);
        $log->setSource($source);
        $log->setHash(md5($message . $level . $channel));

        $this->em->persist($log);
        $this->em->flush();

        $output->writeln('<info> Log créé avec succès.</info>');
        return Command::SUCCESS;
    }
}
