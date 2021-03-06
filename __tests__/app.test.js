const db = require('../db/connection.js');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const app = require('../app.js');
const request = require('supertest');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('GET /api/categories', () => {
  test('200 || return an object containing an array of categories and their descriptions', () => {
    return request(app)
      .get('/api/categories')
      .expect(200)
      .then(({ body }) => {
        expect(body.categories).toBeInstanceOf(Array);
        body.categories.forEach((category) => {
          expect(category).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe('GET || /api/reviews/:review_id', () => {
  test('200 || return an object containing review properties of the review_id passed in', () => {
    return request(app)
      .get('/api/reviews/5')
      .expect(200)
      .then(({ body }) => {
        expect(body.review).toBeInstanceOf(Array);
        body.review.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              designer: expect.any(String),
              review_img_url: expect.any(String),
              category: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test('400 || returns a bad request when review_id is invalid', () => {
    return request(app)
      .get('/api/reviews/pineapple')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test("404 || returns error message when review_id is a valid input but doesn't exist", () => {
    return request(app)
      .get('/api/reviews/3467')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
});

describe('PATCH || /api/reviews/:review_id', () => {
  test('200 || responds with an object with incremented votes of the review_id entered when passed a positive vote increase', () => {
    const updatedVote = {
      inc_votes: 10,
    };
    return request(app)
      .patch('/api/reviews/3')
      .send(updatedVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.review).toEqual({
          review_id: 3,
          title: 'Ultimate Werewolf',
          designer: 'Akihisa Okui',
          owner: 'bainesface',
          review_img_url:
            'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
          review_body: "We couldn't find the werewolf!",
          category: 'social deduction',
          created_at: '2021-01-18T10:01:41.251Z',
          votes: 15,
        });
      });
  });
  test('200 || returns on object with decremented votes when passed a minus number in updatedVote variable', () => {
    const updatedVote = {
      inc_votes: -10,
    };
    return request(app)
      .patch('/api/reviews/3')
      .send(updatedVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.review).toEqual({
          review_id: 3,
          title: 'Ultimate Werewolf',
          designer: 'Akihisa Okui',
          owner: 'bainesface',
          review_img_url:
            'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
          review_body: "We couldn't find the werewolf!",
          category: 'social deduction',
          created_at: '2021-01-18T10:01:41.251Z',
          votes: -5,
        });
      });
  });
  test('400 || when nothing is passed into the inc_votes, display error message', () => {
    const updatedVote = {};
    return request(app)
      .patch('/api/reviews/3')
      .send(updatedVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('400 || when an invalid data type is passed into inc_votes return error', () => {
    const updatedVote = {
      inc_votes: 'smoothie',
    };
    return request(app)
      .patch('/api/reviews/3')
      .send(updatedVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('400 || when an invalid data type of review_id is entered, return an error', () => {
    const updatedVote = {
      inc_votes: 15,
    };
    return request(app)
      .patch('/api/reviews/invalid!')
      .send(updatedVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('404 || when a review_id is a valid data type but does not exist, return error', () => {
    const updatedVote = {
      inc_votes: 15,
    };
    return request(app)
      .patch('/api/reviews/976854')
      .send(updatedVote)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
});

describe('GET || /api/reviews', () => {
  test('200 || returns an array of review objects with all the properties', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({ body }) => {
        expect(body.reviews).toBeInstanceOf(Array);
        body.reviews.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              category: expect.any(String),
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test('200 || accept a query and returns the reviews in order of query', () => {
    return request(app)
      .get(`/api/reviews?sort_by=comment_count`)
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy('comment_count', {
          descending: true,
          coerce: true,
        });
      });
  });
  test('200 || accept a query and returns the reviews in default order (date and descending)', () => {
    return request(app)
      .get(`/api/reviews`)
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy('created_at', { descending: true });
      });
  });
  test('200 || accept a category and return games in that category', () => {
    return request(app)
      .get(`/api/reviews?category=euro+game`)
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy('title', { descending: false });
      });
  });
  test('200 || accept a query a return reviews ordered by title in ascending order', () => {
    return request(app)
      .get(`/api/reviews?sort_by=title&&order=asc`)
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy('title', { descending: false });
      });
  });
  test('400 || when an incorrect sort_by is given, return a bad request error', () => {
    return request(app)
      .get(`/api/reviews?sort_by=elephant`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('invalid sort by query');
      });
  });
  test('400 || when an invalid order query is passed return a bad request error', () => {
    return request(app)
      .get(`/api/reviews?sort_by=title&&order=phone`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('invalid order query');
      });
  });
  test("404 || when a category doesn't exist but is a valid query", () => {
    return request(app)
      .get(`/api/reviews?category=dance`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
});

describe('GET || /api/reviews/:review_id/comments', () => {
  test('200 || return an array of objects containing the comments for a specific review', () => {
    return request(app)
      .get(`/api/reviews/3/comments`)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toBeInstanceOf(Array);
        comment.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              body: expect.any(String),
              votes: expect.any(Number),
              author: expect.any(String),
              review_id: expect.any(Number),
              created_at: expect.any(String),
            })
          );
        });
      });
  });

  test('400 || responds with bad request error when passed in an invalid review_id', () => {
    return request(app)
      .get(`/api/reviews/dog/comments`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('404 || responds with path not found error when passed in a review_id that does not exist', () => {
    return request(app)
      .get(`/api/reviews/35565/comments`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
});

describe('POST || /api/reviews/:review_id/comments', () => {
  test('201 || returns the new posted comment', () => {
    const newComment = {
      username: 'philippaclaire9',
      body: 'This game is the best game ever, yaaaayy',
    };
    return request(app)
      .post('/api/reviews/1/comments')
      .send(newComment)
      .expect(201)
      .then(({ body: { newComment } }) => {
        expect(newComment).toEqual(
          expect.objectContaining({
            votes: expect.any(Number),
            author: expect.any(String),
            body: expect.any(String),
            review_id: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });
  test('400 || if the post object is empty send back bad request error', () => {
    const newComment = {};
    return request(app)
      .post('/api/reviews/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('400 || if username field is empty send back bad request error', () => {
    const newComment = {
      body: 'hgvajbknsfldg',
    };
    return request(app)
      .post('/api/reviews/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('400 || if review_id is an invalid entry return bad request error', () => {
    const newComment = {
      username: 'mallionaire',
      body: 'best game EVERR',
    };
    return request(app)
      .post('/api/reviews/dog/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('404 || if review_id entered valid but does not exist return path not found error', () => {
    const newComment = {
      username: 'mallionaire',
      body: 'best game EVERR',
    };
    return request(app)
      .post('/api/reviews/14567/comments')
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
});

describe('DELETE || /api/comments/:comment_id', () => {
  test('204 || return no content', () => {
    return request(app)
      .delete('/api/comments/2')
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test('400 || return error when the comment_id is invalid', () => {
    return request(app)
      .delete('/api/comments/dog')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request :(');
      });
  });
  test('404 || return an error when the comment_id does not exist', () => {
    return request(app)
      .delete('/api/comments/546')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
});

describe('GET || /api', () => {
  test('200 || return all the available endpoints on the API', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(typeof body).toBe('object');
      });
  });
});

describe('GET || /api/users', () => {
  test('200 || return all the usernames from users', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        expect(body.users[0].username).toBe('mallionaire');
        expect(body.users[1].username).toBe('philippaclaire9');
        expect(body.users[3].username).toBe('dav3rid');
      });
  });
});

describe('GET || /api/users/:username', () => {
  test('200 || return an object containing the selected usernames username, URL, name', () => {
    return request(app)
      .get('/api/users/mallionaire')
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user[0]).toEqual(
          expect.objectContaining({
            username: expect.any(String),
            avatar_url: expect.any(String),
            name: expect.any(String),
          })
        );
      });
  });
  test('400 || return error when the username is invalid', () => {
    return request(app)
      .get('/api/users/346')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
  test('404 || return an error when the username does not exist', () => {
    return request(app)
      .get('/api/users/lemon')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Path not found');
      });
  });
});
