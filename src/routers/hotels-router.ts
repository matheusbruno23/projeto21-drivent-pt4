import { Router } from 'express';
import { ValidateTicketParams, authenticateToken, validateParams, validateTicket } from '@/middlewares';
import { getHotelByIdController, listHotelsController } from '@/controllers/hotels-controller';
import { getHotelByIdSchema } from '@/schemas/hotels-schemas';
import { paymentRequiredError } from '@/errors/payment-required-error';
import { notFoundError } from '@/errors';

const hotelsRouter = Router();

const validateTicketParams: ValidateTicketParams = {
  onMissingEnrollmentOrTicket: notFoundError(),
  onWrongTicketState: paymentRequiredError(),
};

hotelsRouter
  .all('/*', authenticateToken, validateTicket(validateTicketParams))
  .get('/', listHotelsController)
  .get('/:hotelId', validateParams(getHotelByIdSchema), getHotelByIdController);

export { hotelsRouter };
