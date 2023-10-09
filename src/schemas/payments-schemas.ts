import Joi from 'joi';
import { CardData, GetPaymentQuery, ProcessPaymentBody } from '@/protocols';

export const getPaymentQuerySchema = Joi.object<GetPaymentQuery>({
  ticketId: Joi.number().integer().positive().required(),
});

export const processPaymentSchema = Joi.object<ProcessPaymentBody>({
  ticketId: Joi.number().positive().integer().required(),
  cardData: Joi.object<CardData>({
    issuer: Joi.string().required(),
    number: Joi.number().positive().integer().required(),
    name: Joi.string().required(),
    expirationDate: Joi.string().required(), // Unvalidated as date
    cvv: Joi.number().positive().integer().required(),
  }).required(),
});
