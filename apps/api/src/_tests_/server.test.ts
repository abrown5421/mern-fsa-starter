import request from 'supertest';
import express from 'express';

const app = express();
app.get('/', (req, res) => res.status(200).send('API is running!'));

describe('GET /', () => {
  it('should return 200 and message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('API is running!');
  });
});
