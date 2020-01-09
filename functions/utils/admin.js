const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount.json');
const firebase = require('./config');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://konnect-4088f.firebaseio.com"
});


const db = firebase.firestore();

module.exports = {db, admin}
