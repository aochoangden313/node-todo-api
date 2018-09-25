const MongoClient = require('mongodb').MongoClient;

// Version mongodb >= 3.0 need to change to this syntax not '(err, db) ==> (err, client)'
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('COnnect to MongoDB Server');

    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
        text: 'Something to do',
        completed: false,
    }, (err, result) => {
        if (err) {
            return console.log('Unable to insert todo', err);
        }
        console.log('Insert to Todos sucessfully');
        console.log(JSON.stringify(result.ops, undefined, 2));
    })

    // Insert new doc into Usres (name, age, location)
    db.collection('Users').insertOne({
        name: 'Quan Le Van',
        age: 26,
        location: 'Ha Noi',
    }, (err, result) => {
        if (err) {
            return console.log('Unable to insert todo', err);
        }
        console.log('Insert to Users sucessfully');
        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    client.close();
});