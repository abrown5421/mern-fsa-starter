import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import userRoutes from './routes/users.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
