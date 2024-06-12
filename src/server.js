const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { sequelize, User } = require('./models');
const csurf = require('csurf');
const validator = require('validator');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use(csurf({ cookie: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const users = [];

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email) || !validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ message: 'Invalid input.' });
  }
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ message: 'Email is already in use.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { name: validator.escape(name), email: validator.normalizeEmail(email), password: hashedPassword };
  users.push(newUser);
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      res.status(201).json({ user: newUser });
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email) || !validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ message: 'Invalid input.' });
  }
  const user = users.find(user => user.email === validator.normalizeEmail(email));
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const token = jwt.sign({ email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(200).json({ token });
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

sequelize.sync()
  .then(() => {
    const options = {
      key: fs.readFileSync('path/to/your/private-key.pem'),
      cert: fs.readFileSync('path/to/your/certificate.pem')
    };
    https.createServer(options, app).listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});