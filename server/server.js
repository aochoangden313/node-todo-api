var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

// var Todo = mongoose.model('Todo', {
//     text: {
//         type: String,
//     },
//     completed: {
//         type: Boolean,
//     },
//     completedAt: {
//         type: Number,
//     }
// });

// var newTodo = new Todo({
//     text: 'Cook dinner',
//     completed: 123,
//     completedAt: 'adsf',
// });

// newTodo.save().then((doc) => {
//     console.log('save todo ', doc);
// }, (e) => {
//     console.log('Unable to save to Todo');
// });

// User model
// Email - string - required - min length = 1

var User = mongoose.model('Users', {
    user: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
    age: {
        type: Number,
        default: 0,
    }
});

var newUser = new User({
    user: 'quanlv',
    email: '  hello',
})

newUser.save().then((doc) => {
    console.log('save User ', doc);
}, (e) => {
    console.log('Unable to save to User');
});