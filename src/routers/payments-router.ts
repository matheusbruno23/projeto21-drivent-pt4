import { Router } from 'express';
import { authenticateToken, validateBody, validateQuery } from '@/middlewares';
import { getPaymentQuerySchema, processPaymentSchema } from '@/schemas/payments-schemas';
import { getPaymentController, processPaymentController } from '@/controllers/payments-controller';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', validateQuery(getPaymentQuerySchema), getPaymentController)
  .post('/process', validateBody(processPaymentSchema), processPaymentController);

export { paymentsRouter };
