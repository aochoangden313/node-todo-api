const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { ObjectID } = require('mongodb');

var todos = [
  {
    _id: new ObjectID(),
    text: 'First todo test item',
    completed: true,
    complatedAt: 333,
  },
  {
    _id: new ObjectID(),
    text: 'Second todo test item',
  }
];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
});

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

  it('Sholud return 404 if todo not found', (done) => {
    var todoId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${todoId}`)
      .expect(404)
      .end(done);
  });

  it('Sholud return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });

});

describe('DELTE /todos/:id', () => {
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

  it('Sholud return 404 if todo not found', (done) => {
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

  it('Sholud return 404 for non-object ids', (done) => {
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
    }).end(done);
  });
});