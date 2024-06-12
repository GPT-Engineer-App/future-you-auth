const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { sequelize, User, Job } = require('./models');
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const server = express();
server.use(bodyParser.json());
server.use(helmet());
server.use(csurf({ cookie: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
server.use(limiter);

const users = [];

server.post('/signup', async (req, res) => {
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

server.post('/login', async (req, res) => {
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

// Create a new job listing
server.post('/jobs', async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const job = await Job.create({ title, description, company, location, salary });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all job listings
server.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single job listing by ID
server.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a job listing by ID
server.put('/jobs/:id', async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.title = title;
    job.description = description;
    job.company = company;
    job.location = location;
    job.salary = salary;
    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a job listing by ID
server.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    await job.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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