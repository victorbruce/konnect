const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://konnect-4088f.firebaseio.com"
});

const express = require('express');
const app = express();

// get screams
app.get('/screams', (req, res) => {
  admin.firestore().collection('screams').get()
  .then(data => {
    let screams = [];
    data.forEach(doc => {
      screams.push(doc.data())
    });
    return res.json(screams);
  }).catch(error =>  console.error('Get screams', error))
})

// create scream
app.post('/scream', (req, res) => {
  let scream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  }

  admin.firestore().collection('screams').add(scream)
  .then(doc => {
    return res.json({message: `document ${doc.id} created successfully`})
  })
  .catch(error => {
    console.error('Create screams', error);
    return res.status(500).json({error: 'something went wrong'});
  })
});

exports.api = functions.https.onRequest(app);