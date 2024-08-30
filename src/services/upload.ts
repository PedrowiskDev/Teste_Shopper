import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});

// Validação
const validateRequest = [
    body('image').isBase64().withMessage('A imagem deve estar em formato base64.'),
    body('customer_code').isString().withMessage('O código do cliente deve ser uma string.'),
    body('measure_datetime').isISO8601().withMessage('A data da leitura deve estar em formato ISO 8601.'),
    body('measure_type').isIn(['WATER', 'GAS']).withMessage('O tipo de leitura deve ser WATER ou GAS.'),
];

export const uploadImage = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: errors.array().map(err => err.msg).join(', '),
        });
    }

    const { image, customer_code, measure_datetime, measure_type } = req.body;

    // Não é possivel checar uma leitura existente ja que nao tenho acesso a um BD
    const existingReading = await checkForExistingReading(customer_code, measure_type, measure_datetime);
    if (existingReading) {
        return res.status(409).json({
            error_code: 'DOUBLE_REPORT',
            error_description: 'Leitura do mês já realizada',
        });
    }

    try {
        const buffer = Buffer.from(image, 'base64');
        
        const tempFilePath = path.join(__dirname, `temp-${uuidv4()}.jpg`);
        fs.writeFileSync(tempFilePath, buffer);

        // API File e obter o URI
        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
            mimeType: 'image/jpeg',
            displayName: 'Customer Meter Reading',
        });

        const fileUri = uploadResponse.file.uri;
        const measure_uuid = uuidv4();

        // Excluir o arquivo temporário após o upload
        fs.unlinkSync(tempFilePath);

        const result = await model.generateContent([
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

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error_code: 'GEMINI_API_ERROR',
            error_description: 'Erro ao integrar com a API do Gemini',
        });
    }
};

// Função ficticia por falta de explicação na ducumentação do teste
async function checkForExistingReading(customer_code: string, measure_type: string, measure_datetime: string): Promise<boolean> {
    return false;
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
