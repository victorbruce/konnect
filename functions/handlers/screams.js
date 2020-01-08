const {db} = require('../utils/admin');
const {isEmpty} = require('../utils/validators');

exports.getAllScreams = (req, res) => {
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
  }).catch(error =>  {
    console.error('Get screams', error)})
    return res.status(500).json({error: 'something went wrong'});
}

exports.postOneScream = (req, res) => {
  if (isEmpty(req.body.body)) {
    return res.status(400).json({body: 'Must not be empty'});
  }
  let scream = {
    body: req.body.body,
    userHandle: req.user.handle,
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
}