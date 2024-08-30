import fs from 'fs';
import path from 'path';

const dbFilePath = path.join(__dirname, 'measurements.json');

function loadDB() {
  if (fs.existsSync(dbFilePath)) {
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

export const getCustomerMeasures = (customer_code: string, measure_type?: string) => {
  const data = loadDB();
  return data.filter((measure: any) => measure.customer_code === customer_code && (!measure_type || measure.measure_type === measure_type));
};

function saveDB(data: any) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

export async function checkIfMeasureExists(measure_uuid: string) {
  const data = loadDB();
  return data.find((measure: any) => measure.measure_uuid === measure_uuid);
}

export async function saveConfirmedValue(measure_uuid: string, confirmed_value: number) {
  const data = loadDB();
  const measureIndex = data.findIndex((measure: any) => measure.measure_uuid === measure_uuid);

  if (measureIndex !== -1) {
    data[measureIndex].has_confirmed = true;
    data[measureIndex].confirmed_value = confirmed_value;
    saveDB(data);
  }
}
