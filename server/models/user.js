var validator = require('validator');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema(
    {
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
    }
);

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

// We do not user arrow function here because it do not bind this value
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function(token) {
    var User = this;
    return User.update(
        {
            $pull: {
                tokens: { token }
            }
        }
    );
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    // Find user in the DB with email like input
    // If this user exist, get user's password and comparing with inputed password using brypt.compare
    // If it match, return user with Id and email --> return promise resolve
    // If it doensn't match --> return promise reject

    var User = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (e, result) => {
                if (!result) {
                    reject({});
                } else {
                    resolve(user);
                }
            })
        });
    }).catch((err) => {
        Promise.reject();
    });
};

UserSchema.pre('save', function(next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };