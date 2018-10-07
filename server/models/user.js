var validator = require('validator');
var mongoose = require('mongoose');

// {
//     email: 'quanlv.56@gmail.com',
//     password: 'ksdjfhakjdfsdf',
//     tokens: [{
//         access: 'auth',
//         token: 'dsafsdafasdfasdfafasdfdasf'
//     }]
// }

var User = mongoose.model('Users', {
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        }
    }]

});

module.exports =  {User};