import { NextFunction, Response } from 'express';
import { ApplicationError, AuthenticatedRequest } from '@/protocols';
import { prisma } from '@/config';

export interface ValidateTicketParams {
  onMissingEnrollmentOrTicket: ApplicationError;
  onWrongTicketState: ApplicationError;
}

export function validateTicket(errorsToThrow: ValidateTicketParams) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { Enrollment: { include: { Ticket: { include: { TicketType: true } } } } },
    });

    if (user.Enrollment.length === 0 || user.Enrollment[0].Ticket.length === 0) {
      throw errorsToThrow.onMissingEnrollmentOrTicket;
    }

    if (
      user.Enrollment[0].Ticket[0].status !== 'PAID' ||
      user.Enrollment[0].Ticket[0].TicketType.isRemote ||
      !user.Enrollment[0].Ticket[0].TicketType.includesHotel
    ) {
      throw errorsToThrow.onWrongTicketState;
    }

    next();
  };
}
