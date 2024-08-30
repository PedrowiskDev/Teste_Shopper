"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const upload_1 = require("../services/upload");
const confirm_1 = require("../services/confirm");
const list_1 = require("../services/list");
// Configura o aplicativo Express para teste
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/upload', upload_1.uploadImage);
app.patch('/confirm', confirm_1.confirmMeasurement);
app.get('/:customer_code/list', list_1.listMeasurements);
describe('API Endpoints', () => {
    it('should upload an image and return measurement data', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
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
    }));
    it('should confirm a measurement', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .patch('/confirm')
            .send({
            measure_uuid: 'sample-uuid',
            confirmed_value: 100,
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
    }));
    it('should list measurements for a customer', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/12345/list')
            .query({ measure_type: 'WATER' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('customer_code', '12345');
        expect(response.body.measures).toBeInstanceOf(Array);
    }));
});
