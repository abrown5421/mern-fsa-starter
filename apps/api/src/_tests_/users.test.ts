import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import userRouter from '../routes/users.routes';
import { comparePassword } from '../shared/password';
import { UserModel } from '../entities/user/user.model';

let mongoServer: MongoMemoryServer;
let app: express.Application;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI!);

  app = express();
  app.use(express.json());
  app.use('/api/users', userRouter);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Users Feature (Base CRUD + Hooks)', () => {
  let userId: string;

  it('should create a user and hash password', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        password: 'secret123',
        type: 'user',
      });

    expect(res.status).toBe(201);
    expect(res.body.firstName).toBe('Alice');
    expect(res.body.password).not.toBe('secret123'); 
    userId = res.body._id;

    const userInDb = await UserModel.findById(userId);
    const match = await comparePassword('secret123', userInDb!.password);
    expect(match).toBe(true);
  });

  it('should read a user', async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('alice@example.com');
  });

  it('should update a user and hash new password', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ password: 'newpass123', firstName: 'Alicia' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Alicia');

    const userInDb = await UserModel.findById(userId);
    const match = await comparePassword('newpass123', userInDb!.password);
    expect(match).toBe(true);
  });

  it('should delete a user', async () => {
    const res = await request(app).delete(`/api/users/${userId}`);
    expect(res.status).toBe(204);

    const userInDb = await UserModel.findById(userId);
    expect(userInDb).toBeNull();
  });
});
