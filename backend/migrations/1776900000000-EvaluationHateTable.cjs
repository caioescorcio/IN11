/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class EvaluationHateTable1776900000000 {
  name = 'EvaluationHateTable1776900000000';

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE "evaluation_hate" (
        "user_id"       uuid NOT NULL,
        "evaluation_id" uuid NOT NULL,
        CONSTRAINT "PK_evaluation_hate" PRIMARY KEY ("user_id", "evaluation_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "evaluation_hate"
      ADD CONSTRAINT "FK_evaluation_hate_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "evaluation_hate"
      ADD CONSTRAINT "FK_evaluation_hate_evaluation"
      FOREIGN KEY ("evaluation_id") REFERENCES "evaluation"("evaluation_id") ON DELETE CASCADE
    `);
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "evaluation_hate" DROP CONSTRAINT "FK_evaluation_hate_evaluation"`);
    await queryRunner.query(`ALTER TABLE "evaluation_hate" DROP CONSTRAINT "FK_evaluation_hate_user"`);
    await queryRunner.query(`DROP TABLE "evaluation_hate"`);
  }
};
