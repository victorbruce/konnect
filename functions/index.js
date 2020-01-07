const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
const firebase = require('firebase');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://konnect-4088f.firebaseio.com"
});

firebase.initializeApp({
  apiKey: "AIzaSyBavIsf9J0hWCwTTj3oz-tQLLu62093c7c",
  authDomain: "konnect-4088f.firebaseapp.com",
  databaseURL: "https://konnect-4088f.firebaseio.com",
  projectId: "konnect-4088f",
  storageBucket: "konnect-4088f.appspot.com",
  messagingSenderId: "1003018423062",
  appId: "1:1003018423062:web:3a4fe32e79d4bcd9cf5e37",
  measurementId: "G-TJM2BX5P7H"
})

const express = require('express');
const app = express();
const db = admin.firestore();

// get screams
app.get('/screams', (req, res) => {
  db.collection('screams').orderBy('createadAt', 'desc').get()
  .then(data => {
    let screams = [];
    data.forEach(doc => {
      screams.push({
        screamId: doc.id,
        body: doc.data().body,
        userHandle: doc.data().userHandle,
        createdAt: doc.data().createdAt
      })
    });
    return res.json(screams);
  }).catch(error =>  console.error('Get screams', error))
})

// create scream
app.post('/scream', (req, res) => {
  let scream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  }

  db.collection('screams').add(scream)
  .then(doc => {
    return res.json({message: `document ${doc.id} created successfully`})
  })
  .catch(error => {
    console.error('Create screams', error);
    return res.status(500).json({error: 'something went wrong'});
  })
});

// sign up route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  // TODO: validation
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      // check if user handle already exists
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken'})
      } else {
        // else create a new user
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      }
      // persist user to the database
      return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => {
      res.status(201).json({token})
    })
    .catch(error => {
      if (error.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use'})
      } else {
        return res.status(500).json({error: error.code})
      }
    })
})

exports.api = functions.https.onRequest(app);