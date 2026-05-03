/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class EvaluationTableUpdate1777806175513 {
    name = 'EvaluationTableUpdate1777806175513'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate" DROP CONSTRAINT "FK_evaluation_hate_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate" DROP CONSTRAINT "FK_evaluation_hate_evaluation"
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate"
            ADD CONSTRAINT "FK_177ca6ed1a37b532b8a79e4dbd3" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate"
            ADD CONSTRAINT "FK_043eeb1d84578d69ccffae538ce" FOREIGN KEY ("evaluation_id") REFERENCES "evaluation"("evaluation_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate" DROP CONSTRAINT "FK_043eeb1d84578d69ccffae538ce"
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate" DROP CONSTRAINT "FK_177ca6ed1a37b532b8a79e4dbd3"
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate"
            ADD CONSTRAINT "FK_evaluation_hate_evaluation" FOREIGN KEY ("evaluation_id") REFERENCES "evaluation"("evaluation_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation_hate"
            ADD CONSTRAINT "FK_evaluation_hate_user" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
}
