import express from 'express';
import { uploadImage } from './services/upload';  // Função do POST /upload
import { confirmMeasurement } from './services/confirm';  // Função do PATCH /confirm
import { listMeasurements } from './services/list';  // Função do GET /<customer code>/list

const app = express();
app.use(express.json());

// Endpoint POST /upload
app.post('/upload', uploadImage);

// Endpoint PATCH /confirm
app.patch('/confirm', confirmMeasurement);

// Endpoint GET /:customer_code/list
app.get('/:customer_code/list', listMeasurements);

app.listen(3001, () => {
  console.log('Server running on port 3000');
});
