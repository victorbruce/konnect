const functions = require('firebase-functions');
const express = require('express');
const app = express();

const {getAllScreams, postOneScream} = require('./handlers/screams');
const {signup, login, uploadImage} = require('./handlers/users');
const FBAuth = require('./utils/fbAuth');


// screams route

app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream);

// users route
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage)

exports.api = functions.https.onRequest(app);