const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const csurf = require('csurf');
const validator = require('validator');
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const server = express();
server.use(bodyParser.json());

// CSRF protection middleware
const csrfProtection = csurf({ cookie: true });
server.use(csrfProtection);

// Input validation and sanitization middleware
server.use((req, res, next) => {
  if (req.body.email) {
    req.body.email = validator.normalizeEmail(req.body.email);
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
  }
  if (req.body.password && !validator.isStrongPassword(req.body.password)) {
    return res.status(400).json({ message: 'Password is not strong enough.' });
  }
  next();
});

const users = [];

server.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ message: 'Email is already in use.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { name, email, password: hashedPassword };
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

server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);
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

// HTTPS setup using Let's Encrypt
const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

const httpsServer = https.createServer(credentials, server);

httpsServer.listen(3000, () => {
  console.log('HTTPS Server is running on port 3000');
});