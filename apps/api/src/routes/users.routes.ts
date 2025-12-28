import { Router } from 'express';
import { createUser } from '../features/users/createUser';
import { UserModel } from '../entities/user/user.model';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
        console.log(err.message); 
    } else {
        console.log("An unexpected error occurred", err);
    }
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
        console.log(err.message); 
    } else {
        console.log("An unexpected error occurred", err);
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error) {
        console.log(err.message); 
    } else {
        console.log("An unexpected error occurred", err);
    }
  }
});

export default router;
