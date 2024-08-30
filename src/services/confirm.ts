// Não entendi muito bem, nao tenho aceeso ao bd para checar a existencia de medições
// criei um json para simular
import { Request, Response } from 'express';
import { checkIfMeasureExists, saveConfirmedValue } from './db';

export const confirmMeasurement = async (req: Request, res: Response) => {
  const { measure_uuid, confirmed_value } = req.body;

  if (typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
    return res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'Dados inválidos fornecidos.',
    });
  }

  // Verifica se a leitura existe
  const measure = await checkIfMeasureExists(measure_uuid);
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
  await saveConfirmedValue(measure_uuid, confirmed_value);

  res.status(200).json({ success: true });
};
