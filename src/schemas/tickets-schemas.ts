import Joi from 'joi';
import { CreateTicketBody } from '@/protocols';

export const createTicketSchema = Joi.object<CreateTicketBody>({
  ticketTypeId: Joi.number().integer().positive().required(),
});
