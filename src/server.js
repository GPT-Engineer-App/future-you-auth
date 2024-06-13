const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { sequelize, User } = require('./models');
const csurf = require('csurf');
const validator = require('validator');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const serviceAccount = require('./path/to/serviceAccountKey.json');
const authMiddleware = require('./middleware/authMiddleware');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<your-database-name>.firebaseio.com'
});

const server = express();
server.use(bodyParser.json());
server.use(helmet());
server.use(csurf({ cookie: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
server.use(limiter);

server.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email) || !validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ message: 'Invalid input.' });
  }
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });
    res.status(201).json({ user: userRecord });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email) || !validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ message: 'Invalid input.' });
  }
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Invalid email or password.' });
  }
});

server.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'This is a protected route.' });
});

sequelize.sync()
  .then(() => {
    const options = {
      key: fs.readFileSync('path/to/your/private-key.pem'),
      cert: fs.readFileSync('path/to/your/certificate.pem')
    };
    https.createServer(options, server).listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });