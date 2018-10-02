
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const User = require('./models/user');
const { ObjectID } = require('mongodb');

const port = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (error) => {
        res.status(400).send(error);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((docs) => {
        res.send(docs);
    }, (error) => {
        res.status(400).send(err);
    })
});

// Get todo object by id
app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    console.log(`id ${id}`);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({});
    }

    // Delete with inputed ID
    Todo.findById(id).then((doc) => {
        if (!doc) {
            return res.status(404).send({});
        }
        return res.send(doc);
    }).catch((e) => {
        return res.status(400).send({});
    })
});

// Delete todo object by id
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({});
    }

    // Delete with inputed ID
    Todo.findByIdAndRemove(id).then((doc) => {
        if (!doc) {
            return res.status(404).send({});
        }
        return res.send(doc);
    }).catch((e) => {
        return res.status(400).send({});
    })
});

// Update todo object by id
app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({});
    }

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

    Todo.findByIdAndUpdate(id, {
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

app.listen(port, () => {
    console.log(`Started up on port ${port}`);
});

module.exports = { app };
