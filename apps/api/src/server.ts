import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import userRoutes from './routes/users.routes';
import authRoutes from './routes/auth.routes';
import figlet from 'figlet';
import cookieParser from 'cookie-parser';
import session from 'express-session';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  console.log(figlet.textSync("Welcome", { font: "Big" }));
  console.log("The server is running!\n");
});

app.use(cookieParser());

app.use(
  session({
    name: 'sid', 
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    },
  })
);

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
