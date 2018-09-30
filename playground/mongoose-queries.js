const { ObjectID }  = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

const todoId = '5bb028671cff56641cba43d2';
const userId = '5bae441c79d6f3ec040d9bca';

if (!ObjectID.isValid(todoId)) {
    console.log('todoId is invalid');
};

if (!ObjectID.isValid(userId)) {
    console.log('userId is invalid');
};

// There are some kind of find funciton on the mongoose which we can use in this case (query by ID)
// find(): --> will return an array which is matching with condition
// findOne(): --> find oneDocument, return first document, which is matched with condition
// findById(): -->Finds a single document by its _id field
Todo.findById(todoId).then((todo) => {
    console.log(`Todo module`);
    if (!todo) {
        return console.doc('There is no document matching with inputed id');
    };
    console.log(todo);
}).catch((e) => {
    console.log(e.message);
});

// Find with user
User.findById(userId).then((user) => {
    console.log(`User module`);
    if (!user) {
        return console.log('There are no user matching with this id');
    };
    console.log(user);
}).catch((e) => {
    console.log(e.message);
});