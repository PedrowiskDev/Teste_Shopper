"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("./services/upload"); // Função do POST /upload
const confirm_1 = require("./services/confirm"); // Função do PATCH /confirm
const list_1 = require("./services/list"); // Função do GET /<customer code>/list
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Endpoint POST /upload
app.post('/upload', upload_1.uploadImage);
// Endpoint PATCH /confirm
app.patch('/confirm', confirm_1.confirmMeasurement);
// Endpoint GET /:customer_code/list
app.get('/:customer_code/list', list_1.listMeasurements);
app.listen(3001, () => {
    console.log('Server running on port 3000');
});
