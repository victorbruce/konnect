const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount.json');
const firebase = require('firebase');
const config = require('./config');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://konnect-4088f.firebaseio.com"
});


firebase.initializeApp(config)

const db = firebase.firestore();

module.exports = {db, admin}
