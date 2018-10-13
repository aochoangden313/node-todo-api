
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { ObjectID } = require('mongodb');
const { authenticate } = require('./middleware');

const bcrypt = require('bcryptjs');

const port = process.env.PORT;

var app = express();
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var user = req.user;
    var todo = new Todo({
        text: req.body.text,
        _creator: user._id,
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (error) => {
        res.status(400).send(error);
    });
});

app.get('/todos', authenticate, (req, res) => {
    var user = req.user;
    Todo.find({ _creator: user._id }).then((docs) => {
        res.send(docs);
    }, (error) => {
        res.status(400).send(err);
    })
});

// Get todo object by id
app.get('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    const reqUser = req.user;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({});
    }

    // // Delete with inputed ID
    // Todo.findById(id).then((doc) => {
    // If using authenticate, we only find todo item which belong to exactly user
    // Using findOne function
    Todo.findOne({
        _id: id,
        _creator: reqUser._id,
    }).then((doc) => {
        if (!doc) {
            return res.status(404).send({});
        }
        return res.send(doc);
    }).catch((e) => {
        return res.status(400).send({});
    })
});

// Delete todo object by id
app.delete('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    const reqUser = req.user;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({});
    }

    // // Delete with inputed ID
    // Todo.findByIdAndRemove(id).then((doc) => {
    // If using authenticate, we only delete todo item which belong to exactly user
    // Using findOne function
    Todo.findOneAndRemove({
        _id: id,
        _creator: reqUser._id,
    }).then((doc) => {
        if (!doc) {
            return res.status(404).send({});
        }
        return res.send(doc);
    }).catch((e) => {
        return res.status(400).send({});
    })
});

// Update todo object by id
app.patch('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({});
    }

    const reqUser = req.user;

    // Only allow user update some fields like: text, compeleted
    // Do not allow user update filed: completedAt
    // Using function: _pick() on lodash lib to creates an object composed of the picked object properties.
    let body = _.pick(req.body, ['text', 'completed']);

    // Set completedAt attribute with current time
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    // Todo.findByIdAndUpdate(_id: id, {
    // If using authenticate, we only delete todo item which belong to exactly user
    Todo.findOneAndUpdate({
        _id: id,
        _creator: reqUser._id,
    }, {
        $set: body
    }, {
            new: true
        }).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send(todo);
        }).catch((e) => {
            return res.status(400).send();
        });
});

// POST /users
app.post('/users', (req, res) => {
    // Pickup attribute ['email', 'password', 'tokens'] to validate and save to db
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// Get user
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users/login {email, password}
// Return user's email, password if login sucessfully
// Return 404 not found if login un-successfully
app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        if (!user) {
            return res.status(400).send({});
        }
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    })
        .catch((e) => {
            res.status(400).send(e);
        })
});

app.delete('/users/me/token', authenticate, (req, res) => {
    var token = req.header['x-auth'];

    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    })
});

app.listen(port, () => {
    console.log(`Started up on port ${port}`);
});

module.exports = { app };
