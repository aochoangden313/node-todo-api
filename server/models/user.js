var mongoose = require('mongoose');

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

module.exports =  {User};