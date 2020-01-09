const {db} = require('../utils/admin');
const firebase = require('../utils/config');

const {validateSignupData, validateLoginData} = require('../utils/validators');

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  const {valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

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
}

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  
  const {errors, valid} = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);
  
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json(token);
    })
    .catch(error => {
      console.log(error);
      if (error.code === 'auth/invalid-email') {
        res.status(403).json({general: 'Wrong credentials, please try again'});
      } else if (error.code === 'auth/user-not-found') {
        res.status(403).json({general: 'Wrong credentials, please try again'});
      }
      return res.status(500).json({error: error.code});
    })
}