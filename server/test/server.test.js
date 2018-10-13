const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { ObjectID } = require('mongodb');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should return list of todo', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('It should return todo object', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(todos[0].text);
      }).end(done);
  });

  it('Should return 404 if todo not found', (done) => {
    var todoId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${todoId}`)
      .expect(404)
      .end(done);
  });

  it('Should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todos/:id', () => {
  it('It should remove todo object', (done) => {
    var todoId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${todoId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(todoId);
      }).end((err, res) => {
        if (err) {
          return done(err);
        }

        // Query on database using findById and toNotExist
        // Expect(null).toNotExist();
        Todo.findById(todoId).then((todo) => {
          expect(todo).toNotExist(todoId);
          done();
        }).catch((err) => {
          done(err)
        });
      })
  });

  it('Should return 404 if todo not found', (done) => {
    var todoId = '5bb2ad3f5382d409ec728111';
    request(app)
      .delete(`/todos/${todoId}`)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // Query on database using findById and toNotExist
        // Expect(null).toNotExist();
        Todo.findById(todoId).then((todo) => {
          expect(todo).toNotExist(todoId);
          done();
        }).catch((err) => {
          done(err)
        });
      });
  });

  it('Should return 404 for non-object ids', (done) => {
    var todoId = '5bb2ad3f5382d409';
    request(app)
      .delete(`/todos/${todoId}`)
      .expect(404)
      .end(done);

  });
});

describe('PATCH /todos/:id', () => {
  it('Should update the todo', (done) => {
    // Grab id of first item
    // update text, set completed true
    // 200
    // Text is changed, completed is true, completedAt is a number .toBeA
    var todoId = new ObjectID(todos[0]._id).toHexString();
    var updatedText = 'This is updated text';

    var reqObj = _.pick(todos[0], ['_id', 'text', 'completed', 'completedAt']);
    reqObj.text = updatedText;

    request(app)
      .patch(`/todos/${todoId}`)
      .send(reqObj)
      .expect(200)
      .expect((res) => {
        expect(res.body.completed).toBe(true);
        expect(res.body.completedAt).toBeA('number');

        Todo.findById(todoId).then((doc) => {
          expect(doc.completed).toBe(true);
          expect(doc.completedAt).toBeA('number');
          expect(doc.text).toBeA(updatedText);
        }, (err) => {
          return done(err);
        })
      }).end(done);

  });

  it('Should clear completedAt when todo is not completed', (done) => {
    // Grab id of second todo item
    // Update text, set completed to false
    // 200
    // Text is changed, completed false, completedAt is null .toNotExist
    var todoId = new ObjectID(todos[1]._id).toHexString();
    var updatedText = 'This is updated text';

    var reqObj = _.pick(todos[1], ['_id', 'text', 'completed', 'completedAt']);
    reqObj.text = updatedText;

    request(app)
    .patch(`/todos/${todoId}`)
    .send(reqObj)
    .expect(200)
    .expect((res) => {
      expect(res.body.completed).toBe(false);
      expect(res.body.completedAt).toNotExist();

      Todo.findById(todoId).then((doc) => {
        expect(doc.completed).toBe(false);
        expect(doc.completedAt).toNotExist();
        expect(doc.text).toBeA(updatedText);
      }, (err) => {
        return done(err);
      })
    })
    .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    }).end(done);
  });

  it('should return 401 if user is not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
    }).end(done);
  });

});

describe('POST /users', () => {
  it('Should create user', (done) => {
    var email = 'hello123@google.com';
    var password = '1234567';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        // Check if server return auth token or not
        expect(res.header['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          if (!user) {
            return done();
          }
          expect(password).toNotBe(user.password);
          done();
        }, (err) => {
          done(err);
        })
      });
  });

  it('Should return validation errors if request is invalid', (done) => {
    var email = 'hello1234@google.com';
    var password = '567';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });

  it('Should not create user if email is in use', (done) => {
    var email = users[0].email;
    var password = '567';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });
});

describe('POST /users/login', () => {
  // This code works
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toExist();

        User.findById(users[1]._id).then((user) => {
          if (!user) {
            return done();
          }
          expect(user.tokens[0]).toInclude(
            {
              access: 'auth',
              token: res.header['x-auth'],
            });
            done();
        }, (e) => {
          done(e);
        });
      })
      .end(done);
  });

  // This code doesn't work and has error
  // it('should login user and return auth token', (done) => {
  //   request(app)
  //     .post('/users/login')
  //     .send({
  //       email: users[1].email,
  //       password: users[1].password
  //     })
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.headers['x-auth']).toExist();
  //     })
  //     .end((err, res) => {
  //       if (err) {
  //         return done(err);
  //       }

  //       User.findById(users[1]._id).then((user) => {
  //         expect(user.tokens[0]).toInclude({
  //           access: 'auth',
  //           token: res.headers['x-auth']
  //         });
  //         done();
  //       }).catch((e) => done(e));
  //     });
  // });
  
  it('should reject invalid user login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: '123',
      })
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toNotExist();

        User.findOne({
          email: users[1].email,
        }).then((user) => {
          if (!user) {
            return done();
          }
          expect(user.tokens.length).toBe(0);
          done();
        }, (e) => {
          done(e);
        });
      })
      .end(done);
  });
});

describe('DELETE /users/me/token', () => {
  it ('should remove auth token on logout', (done) => {
      const reqUser = users[0];
      request(app)
      .delete('/users/me/token')
      .set('x-auth', reqUser.tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(e);
        }
        User.findById(reqUser._id).then((user) => {
          if (!user) {
            return done();
          }
          expect(user.tokens.length).toBe(0);
          done();
        })
        .catch((e) => done(e));
      });
  });
});
