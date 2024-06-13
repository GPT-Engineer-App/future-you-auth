const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { sequelize, User, Job } = require('./models');
const csurf = require('csurf');
const validator = require('validator');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const serviceAccount = require('./path/to/serviceAccountKey.json');

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
    const token = jwt.sign({ uid: userRecord.uid }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Invalid email or password.' });
  }
});

// Create a new job listing
server.post('/jobs', async (req, res) => {
  const { title, description, company, location, salary } = req.body;
  try {
    const job = await Job.create({ title, description, company, location, salary });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all job listings
server.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single job listing by ID
server.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findByPk(id);
    if (job) {
      res.status(200).json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a job listing by ID
server.put('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, company, location, salary } = req.body;
  try {
    const job = await Job.findByPk(id);
    if (job) {
      await job.update({ title, description, company, location, salary });
      res.status(200).json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a job listing by ID
server.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findByPk(id);
    if (job) {
      await job.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
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