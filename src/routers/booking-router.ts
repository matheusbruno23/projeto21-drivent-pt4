import { Router } from 'express';
import { ValidateTicketParams, authenticateToken, validateBody, validateTicket } from '@/middlewares';
import { forbiddenError } from '@/errors';
import {
  getBookingController,
  postBookingController,
  updateBookingRoomController,
} from '@/controllers/booking-controller';
import { postOrPutBookingBodySchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();

const err = forbiddenError('Bookings are only available to users who have paid a ticket that includes an hotel');

const validateTicketParams: ValidateTicketParams = {
  onMissingEnrollmentOrTicket: err,
  onWrongTicketState: err,
};

bookingRouter
  .all('/*', authenticateToken, validateTicket(validateTicketParams))
  .get('/', getBookingController)
  .post('/', validateBody(postOrPutBookingBodySchema), postBookingController)
  .put('/:bookingId', validateBody(postOrPutBookingBodySchema), updateBookingRoomController);

export { bookingRouter };
