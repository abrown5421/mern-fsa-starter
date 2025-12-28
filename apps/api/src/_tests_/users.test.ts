import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createUser } from '../features/users/createUser';
import { connectDB } from '../db';
import { UserModel } from '../entities/user/user.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('User CRUD', () => {
  let userId: string;

  it('should create a user', async () => {
    const user = await createUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      type: 'user',
    });
    userId = user._id.toString();
    expect(user.email).toBe('john@example.com');
    expect(user.password).not.toBe('password123'); 
  });

  it('should read a user', async () => {
    const user = await UserModel.findById(userId);
    expect(user?.firstName).toBe('John');
  });

  it('should update a user', async () => {
    const user = await UserModel.findByIdAndUpdate(userId, { firstName: 'Jane' }, { new: true });
    expect(user?.firstName).toBe('Jane');
  });

  it('should delete a user', async () => {
    await UserModel.findByIdAndDelete(userId);
    const user = await UserModel.findById(userId);
    expect(user).toBeNull();
  });
});
