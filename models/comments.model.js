const db = require('../db/connection');

exports.eraseCommentById = (comment_id) => {
  return db
    .query(
      `DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;`,
      [comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Path not found' });
      }
      return rows;
    });
};
