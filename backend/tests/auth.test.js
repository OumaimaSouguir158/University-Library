const request = require('supertest');
const app     = require('../src/app');

describe('Auth API', () => {
  test('POST /api/auth/register — crée un compte', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: `test${Date.now()}@biblio.fr`,
      password: 'password123',
      name: 'Test User',
    });
    expect([201, 409]).toContain(res.status);
  });

  test('POST /api/auth/login — champs manquants → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.fr' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — mauvais mdp → 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@biblio.fr', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
