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
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmMeasurement = void 0;
const db_1 = require("./db");
const confirmMeasurement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { measure_uuid, confirmed_value } = req.body;
    if (typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Dados inválidos fornecidos.',
        });
    }
    // Verifica se a leitura existe
    const measure = yield (0, db_1.checkIfMeasureExists)(measure_uuid);
    if (!measure) {
        return res.status(404).json({
            error_code: 'MEASURE_NOT_FOUND',
            error_description: 'Leitura não encontrada.',
        });
    }
    // Verifica se a leitura já foi confirmada
    if (measure.has_confirmed) {
        return res.status(409).json({
            error_code: 'CONFIRMATION_DUPLICATE',
            error_description: 'Leitura já confirmada.',
        });
    }
    // Salva o valor confirmado
    yield (0, db_1.saveConfirmedValue)(measure_uuid, confirmed_value);
    res.status(200).json({ success: true });
});
exports.confirmMeasurement = confirmMeasurement;
