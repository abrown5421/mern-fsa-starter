import mongoose, { Schema, model, Document } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createBaseCRUD } from '../shared/baseCrud';
import express from 'express';
import request from 'supertest';

interface ITest extends Document {
  name: string;
  value: number;
}

let mongoServer: MongoMemoryServer;
let TestModel: mongoose.Model<ITest>;
let app: express.Application;
let router: express.Router;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI!);

  const TestSchema = new Schema<ITest>({
    name: { type: String, required: true },
    value: { type: Number, required: true },
  });
  TestModel = model<ITest>('Test', TestSchema);

  router = createBaseCRUD(TestModel, {
    preCreate: async (data) => {
      data.name = data.name.toUpperCase(); 
      return data;
    },
  });

  app = express();
  app.use(express.json());
  app.use('/api/test', router);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Base CRUD', () => {
  let docId: string;

  it('should create a document', async () => {
    const res = await request(app)
      .post('/api/test')
      .send({ name: 'abc', value: 42 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('ABC'); 
    docId = res.body._id;
  });

  it('should read a document', async () => {
    const res = await request(app).get(`/api/test/${docId}`);
    expect(res.status).toBe(200);
    expect(res.body.value).toBe(42);
  });

  it('should update a document', async () => {
    const res = await request(app)
      .put(`/api/test/${docId}`)
      .send({ value: 100 });
    expect(res.status).toBe(200);
    expect(res.body.value).toBe(100);
  });

  it('should delete a document', async () => {
    const res = await request(app).delete(`/api/test/${docId}`);
    expect(res.status).toBe(204);
  });
});
