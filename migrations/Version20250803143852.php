<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250803143852 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Description courte de ce que fait cette migration';
    }

    public function up(Schema $schema): void
    {
        // TODO : ajouter ici le code SQL ou les commandes pour appliquer la migration
        // Exemple : $this->addSql('CREATE TABLE example (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
    }

    public function down(Schema $schema): void
    {
        // TODO : ajouter ici le code SQL ou commandes pour annuler la migration
        // Exemple : $this->addSql('DROP TABLE example');
    }
}

