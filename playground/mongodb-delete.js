const { MongoClient, ObjectID } = require('mongodb');

// Version mongodb >= 3.0 need to change to this syntax not '(err, db) ==> (err, client)'
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('COnnect to MongoDB Server');

    const db = client.db('TodoApp');

    // Delete many
    db.collection('Users').deleteMany({ age: 11.0}).then((result) => {
        console.log(result)
    });

    // // Delete one --> delete first 1 document found, return big object
    db.collection('Users').deleteOne({ age: 26}).then((result) => {
        console.log(result)
    });

    // find 1 and delete --> delete first 1 document found, return deleted object
    db.collection('Users').findOneAndDelete({ age: 26}).then((result) => {
        console.log(result)
    });
});