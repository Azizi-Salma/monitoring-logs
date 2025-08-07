<?php

namespace App\DataFixtures;

use App\Entity\Log;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class LogFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $levels = ['info', 'warning', 'error'];
        $sources = ['localhost', 'auth-service', 'payment-service'];
        $channels = ['security', 'database', 'application'];
        $agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'curl/7.68.0',
            'Symfony Console',
        ];

        for ($i = 1; $i <= 20; $i++) {
            $log = new Log();
            $level = $levels[array_rand($levels)];

            $log->setLevel($level);
            $log->setMessage("Message de test #$i - niveau $level");
            $log->setContext(null);
            $log->setChannel($channels[array_rand($channels)]);
            $log->setSource($sources[array_rand($sources)]);
            $log->setCreatedAt(new \DateTimeImmutable('-' . rand(0, 7) . ' days'));
            $log->setUser(null);
            $log->setIpAddress('192.168.1.' . rand(1, 100));
            $log->setUserAgent($agents[array_rand($agents)]);
            $log->setExtra(null);

            $manager->persist($log);
        }

        $manager->flush();
    }
}
