const { sequelize, User } = require('../src/models');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new user', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });
});