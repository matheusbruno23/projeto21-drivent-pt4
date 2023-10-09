import { Response } from 'express';
import { GetPaymentRequest, ProcessPaymentRequest } from '@/protocols';
import paymentsService from '@/services/payments-service';

export async function getPaymentController(req: GetPaymentRequest, res: Response) {
  const ticketId = Number(req.query.ticketId);
  const payment = await paymentsService.getPaymentFromTicket(ticketId, req.userId);
  return res.send(payment);
}

export async function processPaymentController(req: ProcessPaymentRequest, res: Response) {
  const { ticketId, cardData } = req.body;
  const ticketWithPayment = await paymentsService.processPayment(ticketId, cardData, req.userId);
  return res.send(ticketWithPayment.Payment[0]);
}
