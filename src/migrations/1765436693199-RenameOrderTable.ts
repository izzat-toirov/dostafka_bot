import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameOrderTable1765436693199 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the old table exists before renaming
    const oldTableExists = await queryRunner.hasTable('order');
    if (oldTableExists) {
      await queryRunner.renameTable('order', 'orders');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the rename operation
    const newTableExists = await queryRunner.hasTable('orders');
    if (newTableExists) {
      await queryRunner.renameTable('orders', 'order');
    }
  }
}
