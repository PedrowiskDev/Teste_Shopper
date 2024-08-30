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
exports.getCustomerMeasures = void 0;
exports.checkIfMeasureExists = checkIfMeasureExists;
exports.saveConfirmedValue = saveConfirmedValue;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbFilePath = path_1.default.join(__dirname, 'measurements.json');
function loadDB() {
    if (fs_1.default.existsSync(dbFilePath)) {
        const data = fs_1.default.readFileSync(dbFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
}
const getCustomerMeasures = (customer_code, measure_type) => {
    const data = loadDB();
    return data.filter((measure) => measure.customer_code === customer_code && (!measure_type || measure.measure_type === measure_type));
};
exports.getCustomerMeasures = getCustomerMeasures;
function saveDB(data) {
    fs_1.default.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}
function checkIfMeasureExists(measure_uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = loadDB();
        return data.find((measure) => measure.measure_uuid === measure_uuid);
    });
}
function saveConfirmedValue(measure_uuid, confirmed_value) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = loadDB();
        const measureIndex = data.findIndex((measure) => measure.measure_uuid === measure_uuid);
        if (measureIndex !== -1) {
            data[measureIndex].has_confirmed = true;
            data[measureIndex].confirmed_value = confirmed_value;
            saveDB(data);
        }
    });
}
