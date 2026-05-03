/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class EvaluationTable1776794767375 {
    name = 'EvaluationTable1776794767375'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "evaluation" (
                "evaluation_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "hating" double precision NOT NULL,
                "comment" text,
                "comment_deleted" boolean NOT NULL DEFAULT false,
                "hates_count" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" uuid,
                "movie_id" uuid,
                CONSTRAINT "PK_21abac9a373e4fcebb18d01ccd2" PRIMARY KEY ("evaluation_id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_UNIQUE_USER_MOVIE_EVALUATION" ON "evaluation" ("user_id", "movie_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation"
            ADD CONSTRAINT "FK_764ed32806129494bb330866071" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation"
            ADD CONSTRAINT "FK_6ab706da0a7ebf08432f76d458f" FOREIGN KEY ("movie_id") REFERENCES "movie"("movie_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "evaluation" DROP CONSTRAINT "FK_6ab706da0a7ebf08432f76d458f"
        `);
        await queryRunner.query(`
            ALTER TABLE "evaluation" DROP CONSTRAINT "FK_764ed32806129494bb330866071"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_UNIQUE_USER_MOVIE_EVALUATION"
        `);
        await queryRunner.query(`
            DROP TABLE "evaluation"
        `);
    }
}
