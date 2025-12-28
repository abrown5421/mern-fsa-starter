import { Model, Document } from 'mongoose';
import { Router } from 'express';

interface CRUDHooks<T> {
  preCreate?: (data: any) => Promise<any>;
  preUpdate?: (data: any) => Promise<any>;
}

export const createBaseCRUD = <T extends Document>(
  model: Model<T>,
  hooks?: CRUDHooks<T>
) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const data = hooks?.preCreate ? await hooks.preCreate(req.body) : req.body;
      const doc = await model.create(data);
      res.status(201).json(doc);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const docs = await model.find({});
      res.json(docs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const doc = await model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const data = hooks?.preUpdate ? await hooks.preUpdate(req.body) : req.body;
      const doc = await model.findByIdAndUpdate(req.params.id, data, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
};
