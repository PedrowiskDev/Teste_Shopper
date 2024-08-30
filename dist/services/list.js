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
exports.listMeasurements = void 0;
const db_1 = require("./db");
const listMeasurements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_code } = req.params;
    const measure_type = req.query.measure_type;
    if (measure_type && !['WATER', 'GAS'].includes(measure_type.toUpperCase())) {
        return res.status(400).json({ error_code: 'INVALID_TYPE', error_description: 'Tipo de medição não permitida.' });
    }
    try {
        const measures = (0, db_1.getCustomerMeasures)(customer_code, measure_type);
        if (!measures.length) {
            return res.status(404).json({ error_code: 'MEASURES_NOT_FOUND', error_description: 'Nenhuma leitura encontrada.' });
        }
        res.status(200).json({ customer_code, measures });
    }
    catch (error) {
        res.status(500).json({ error_code: 'INTERNAL_ERROR', error_description: 'Erro ao buscar medições.' });
    }
});
exports.listMeasurements = listMeasurements;
