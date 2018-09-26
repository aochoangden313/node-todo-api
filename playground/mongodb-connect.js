const { MongoClient, ObjectID } = require('mongodb');

// Version mongodb >= 3.0 need to change to this syntax not '(err, db) ==> (err, client)'
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('COnnect to MongoDB Server');

    const db = client.db('TodoApp');

    // Query return document from 'Users' Collection by id
    // const collection = db.collection('Users');
    // collection.find({
    //     _id: new ObjectID('5baa4c06c7e66313d4f15fc4')
    // }).toArray((err, docs) => {
    //     if (err) {
    //         console.log(`Can't query from Users collection`);
    //         return;
    //     }
    //     console.log(docs);
    // });

    // Query return all document from 'Users' Collection 
    const collection = db.collection('Users');
    collection.find({age: 26}).toArray((err, docs) => {
        if (err) {
            console.log(`Can't query from Users collection`);
            return;
        }
        console.log(docs);
    });

    // client.close();
});