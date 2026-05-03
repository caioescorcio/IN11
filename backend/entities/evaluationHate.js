import typeorm from 'typeorm';

const EvaluationHate = new typeorm.EntitySchema({
  name: 'EvaluationHate',
  tableName: 'evaluation_hate',
  columns: {
    user_id: {
      type: 'uuid',
      primary: true,
    },
    evaluation_id: {
      type: 'uuid',
      primary: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      onDelete: 'CASCADE',
    },
    evaluation: {
      type: 'many-to-one',
      target: 'Evaluation',
      joinColumn: { name: 'evaluation_id' },
      onDelete: 'CASCADE',
    },
  },
});

export default EvaluationHate;
