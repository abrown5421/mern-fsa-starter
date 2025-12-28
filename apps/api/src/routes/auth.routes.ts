/// <reference path="../types/session.d.ts" />

import { Router } from 'express';
import { UserModel } from '../entities/user/user.model';
import { comparePassword, hashPassword } from '../shared/password';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, type } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await hashPassword(password);
    const user = await UserModel.create({ firstName, lastName, email, password: hashed, type });

    req.session.userId = user._id.toString(); 
    res.status(201).json({ id: user._id, email: user.email, firstName, lastName });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    req.session.userId = user._id.toString(); 
    res.json({ id: user._id, email: user.email, firstName: user.firstName });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('sid'); 
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });

  const user = await UserModel.findById(req.session.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user);
});

export default router;
