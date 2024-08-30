import { Request, Response } from 'express';
import { getCustomerMeasures } from './db';

export const listMeasurements = async (req: Request, res: Response) => {
  const { customer_code } = req.params;
  const measure_type = req.query.measure_type as string | undefined;

  if (measure_type && !['WATER', 'GAS'].includes(measure_type.toUpperCase())) {
    return res.status(400).json({ error_code: 'INVALID_TYPE', error_description: 'Tipo de medição não permitida.' });
  }

  try {
    const measures = getCustomerMeasures(customer_code, measure_type);
    if (!measures.length) {
      return res.status(404).json({ error_code: 'MEASURES_NOT_FOUND', error_description: 'Nenhuma leitura encontrada.' });
    }
    res.status(200).json({ customer_code, measures });
  } catch (error) {
    res.status(500).json({ error_code: 'INTERNAL_ERROR', error_description: 'Erro ao buscar medições.' });
  }
};
