import request from 'supertest';
import express from 'express';
import session from 'express-session';
import authRoutes from '../routes/auth.routes';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app: express.Application;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI!);

  app = express();
  app.use(express.json());
  app.use(
    session({
      secret: 'testsecret',
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use('/api/auth', authRoutes);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth Routes', () => {
  let cookie: string;

  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'John', lastName: 'Doe', email: 'john@test.com', password: '123456' });
    expect(res.status).toBe(201);
    cookie = res.headers['set-cookie'][0];
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('john@test.com');
    cookie = res.headers['set-cookie'][0];
  });

  it('should get current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('john@test.com');
  });

  it('should logout user', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
  });
});
