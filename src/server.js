const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const client = redis.createClient();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

client.on('connect', () => {
  console.log('Connected to Redis...');
});

client.on('error', (err) => {
  console.log('Redis error: ', err);
});

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

const cache = (req, res, next) => {
  const { email } = req.body;
  client.get(email, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  });
};

server.post('/login', cache, async (req, res) => {
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
      client.setex(email, 3600, JSON.stringify({ token }));
      res.status(200).json({ token });
    })
    .catch((error) => {
      res.status(400).json({ message: error.message });
    });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});