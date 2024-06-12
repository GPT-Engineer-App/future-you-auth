const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, User } = require('../src/models');
const server = require('../src/server');

const app = express();
app.use(bodyParser.json());
app.use('/', server);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User API', () => {
  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
  });

  it('should log in an existing user', async () => {
    await request(app)
      .post('/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});