<?php

namespace App\Command;

use App\Entity\Log;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:generate-log')]
class GenerateLogCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $log = (new Log())
            ->setLevel(Log::LEVEL_INFO)
            ->setMessage('Log de test')
            ->setChannel('test_channel')
            ->setSource('localhost')
            ->setIpAddress('127.0.0.1')
            ->setUserAgent('Console');

        $this->em->persist($log);
        $this->em->flush();

        $output->writeln(' Log inséré avec succès.');
        return Command::SUCCESS;
    }
}
