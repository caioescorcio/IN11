import typeorm from 'typeorm';

const Evaluation = new typeorm.EntitySchema({
  name: 'Evaluation',
  columns: {
    evaluation_id: {
      primary: true,
      generated: 'uuid',
      type: 'uuid',
    },
    hating: {
      type: 'float',
    },
    comment: {
      type: 'text',
      nullable: true,
    },
    comment_deleted: {
      type: Boolean,
      default: false,
    },
    hates_count: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      onDelete: 'CASCADE',
    },
    movie: {
      type: 'many-to-one',
      target: 'Movie',
      joinColumn: { name: 'movie_id' },
      onDelete: 'CASCADE',
    },
  },
  indices: [
    {
      name: 'IDX_UNIQUE_USER_MOVIE_EVALUATION',
      unique: true,
      columns: ['user', 'movie'], // Guarantees one evaluation per user per movie
    },
  ],
});

export default Evaluation;
