import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsersTable1703952000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN role ENUM('pacient', 'psicologa') NOT NULL DEFAULT 'pacient'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN role
    `);
  }
}

