const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

const todoId = '5bb0d4d0877974299c21e92c';

// // Do not returned deteled object
// Todo.deleteOne({ _id: new ObjectID(todoId) }).then((doc) => {
//     console.log(`Delete ${doc}`)
// }, (err) => {
//     console.log('Delete unsuccessfully');
// })

// Returned deteled object
// This function always run successfully, it return null if it can't find the record
Todo.findByIdAndRemove(todoId).then((doc) => {
    console.log(`Delete ${doc}`)
}, (err) => {
    console.log('Delete unsuccessfully');
})