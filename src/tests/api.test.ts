import request from 'supertest';
import express from 'express';
import { uploadImage } from '../services/upload';
import { confirmMeasurement } from '../services/confirm';
import { listMeasurements } from '../services/list';

// Configura o aplicativo Express para teste
const app = express();
app.use(express.json());
app.post('/upload', uploadImage);
app.patch('/confirm', confirmMeasurement);
app.get('/:customer_code/list', listMeasurements);

describe('API Endpoints', () => {
  it('should upload an image and return measurement data', async () => {
    const response = await request(app)
      .post('/upload')
      .send({
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA...',
        customer_code: '12345',
        measure_datetime: new Date().toISOString(),
        measure_type: 'WATER',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('image_url');
    expect(response.body).toHaveProperty('measure_value');
    expect(response.body).toHaveProperty('measure_uuid');
  });

  it('should confirm a measurement', async () => {
    const response = await request(app)
      .patch('/confirm')
      .send({
        measure_uuid: 'sample-uuid',
        confirmed_value: 100,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('should list measurements for a customer', async () => {
    const response = await request(app)
      .get('/12345/list')
      .query({ measure_type: 'WATER' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('customer_code', '12345');
    expect(response.body.measures).toBeInstanceOf(Array);
  });
});
