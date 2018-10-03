// On the production environment like Heroku, process.env.NODE_ENV is defaultly set with value is 'production'
// Therefore, we do not need to care about this env on the production environment 
var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env = 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}