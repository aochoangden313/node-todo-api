
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var { Todo } = require('./models/todo');
var User = require('./models/user');
var { ObjectID } = require('mongodb');

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

    // QUery with inputed ID
    Todo.findById(id).then((doc) => {
        if (!doc) {
            return res.status(404).send({});
        }
        return res.send(doc);
    }).catch((e) => {
        return res.status(400).send({});
    })
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};
