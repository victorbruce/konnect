const {db} = require('../utils/admin');

exports.getAllScreams = (req, res) => {
  db.collection('screams')
  .orderBy('createdAt', 'desc')
  .get()
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
    return res.status(200).json(screams);
  })
  .catch( err => {
    console.log('Get screams', err);
    res.status(500).json({err: err.code})
  })
}

exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
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
    return res.status(500).json({error: error.code});
  })
}