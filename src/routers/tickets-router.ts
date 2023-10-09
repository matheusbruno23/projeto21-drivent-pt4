import { Router } from 'express';
import { createTicketController, getTicketFromUserController, getTicketTypesController } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';
import { createTicketSchema } from '@/schemas/tickets-schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypesController)
  .get('/', getTicketFromUserController)
  .post('/', validateBody(createTicketSchema), createTicketController);

export { ticketsRouter };
