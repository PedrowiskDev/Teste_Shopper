"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.uploadImage = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
const fileManager = new server_1.GoogleAIFileManager(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});
// Validação
const validateRequest = [
    (0, express_validator_1.body)('image').isBase64().withMessage('A imagem deve estar em formato base64.'),
    (0, express_validator_1.body)('customer_code').isString().withMessage('O código do cliente deve ser uma string.'),
    (0, express_validator_1.body)('measure_datetime').isISO8601().withMessage('A data da leitura deve estar em formato ISO 8601.'),
    (0, express_validator_1.body)('measure_type').isIn(['WATER', 'GAS']).withMessage('O tipo de leitura deve ser WATER ou GAS.'),
];
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: errors.array().map(err => err.msg).join(', '),
        });
    }
    const { image, customer_code, measure_datetime, measure_type } = req.body;
    // Não é possivel checar uma leitura existente ja que nao tenho acesso a um BD
    const existingReading = yield checkForExistingReading(customer_code, measure_type, measure_datetime);
    if (existingReading) {
        return res.status(409).json({
            error_code: 'DOUBLE_REPORT',
            error_description: 'Leitura do mês já realizada',
        });
    }
    try {
        const buffer = Buffer.from(image, 'base64');
        const tempFilePath = path_1.default.join(__dirname, `temp-${(0, uuid_1.v4)()}.jpg`);
        fs_1.default.writeFileSync(tempFilePath, buffer);
        // API File e obter o URI
        const uploadResponse = yield fileManager.uploadFile(tempFilePath, {
            mimeType: 'image/jpeg',
            displayName: 'Customer Meter Reading',
        });
        const fileUri = uploadResponse.file.uri;
        const measure_uuid = (0, uuid_1.v4)();
        // Excluir o arquivo temporário após o upload
        fs_1.default.unlinkSync(tempFilePath);
        const result = yield model.generateContent([
            {
                fileData: {
                    mimeType: 'image/jpeg',
                    fileUri: fileUri
                }
            },
            { text: "Extract the numeric value from this image." },
        ]);
        const measure_value = parseInt(result.response.text(), 10);
        res.status(200).json({
            image_url: fileUri,
            measure_value,
            measure_uuid,
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error_code: 'GEMINI_API_ERROR',
            error_description: 'Erro ao integrar com a API do Gemini',
        });
    }
});
exports.uploadImage = uploadImage;
// Função ficticia por falta de explicação na ducumentação do teste
function checkForExistingReading(customer_code, measure_type, measure_datetime) {
    return __awaiter(this, void 0, void 0, function* () {
        return false;
    });
}
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
