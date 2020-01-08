const firebase = require('firebase');
const config = require('./config');

// firebase.initializeApp(config);

module.exports = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  // validation
  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = 'Must not be empty';
  }
  if (isEmpty(user.password)) {
    errors.password = 'Must not be empty';
  }
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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