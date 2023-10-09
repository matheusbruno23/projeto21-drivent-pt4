import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketTypeRepository from '@/repositories/ticket-types-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getTicketTypes() {
  return ticketTypeRepository.findMany();
}

async function getTicketFromUser(userId: number) {
  const enrollment = await enrollmentRepository.findEnrollmentFromUser(userId);

  if (enrollment === null) {
    throw notFoundError();
  }

  const ticket = await ticketsRepository.findTicketFromEnrollment(enrollment);

  if (ticket === null) {
    throw notFoundError();
  }

  return ticket;
}

async function createTicket(userId: number, ticketTypeId: number) {
  const enrollment = await enrollmentRepository.findEnrollmentFromUser(userId);

  if (enrollment === null) {
    throw notFoundError();
  }

  return ticketsRepository.createTicket(enrollment.id, ticketTypeId);
}

const ticketsService = { getTicketTypes, getTicketFromUser, createTicket };

export default ticketsService;
