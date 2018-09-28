const { MongoClient, ObjectID } = require('mongodb');

// Version mongodb >= 3.0 need to change to this syntax not '(err, db) ==> (err, client)'
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('COnnect to MongoDB Server');

    const db = client.db('TodoApp');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5baa47c01175cf08e06cced7')
    // }, {
    //     $set: {
    //         text: 'update value of text'
    //     }
    // }, {
    //     returnOriginal: false
    // }).then((result) => {
    //     console.log(result);
    // });

    // db.collection('Users').findOneAndUpdate({
    //     _id: new ObjectID('5baa47c01175cf08e06cced8')
    // }, {
    //     $set: {
    //         name: 'QuanLV'
    //     },
    //     $inc: {
    //         age: 3
    //     }
    // }, {
    //     returnOriginal: true
    // }).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').update({
        _id: new ObjectID('5baa47c01175cf08e06cced9')
    }, {
        $set: {
            name: 'QuanLV 2'
        },
        $setOnInsert: {
            defaultQty: 100
        },

    }, {
        upsert: true,
        returnOriginal: true
    }).then((result) => {
        console.log(result);
    });

});