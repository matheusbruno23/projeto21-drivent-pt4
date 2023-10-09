import httpStatus from 'http-status';
import { Request, Response } from 'express';
import ticketsService from '@/services/tickets-service';
import { AuthenticatedRequest, CreateTicketRequest } from '@/protocols';

export async function getTicketTypesController(_req: Request, res: Response) {
  const ticketTypes = await ticketsService.getTicketTypes();
  return res.send(ticketTypes);
}

export async function getTicketFromUserController(req: AuthenticatedRequest, res: Response) {
  const ticket = await ticketsService.getTicketFromUser(req.userId);
  return res.send(ticket);
}

export async function createTicketController(req: CreateTicketRequest, res: Response) {
  const ticket = await ticketsService.createTicket(req.userId, req.body.ticketTypeId);
  return res.status(httpStatus.CREATED).send(ticket);
}
