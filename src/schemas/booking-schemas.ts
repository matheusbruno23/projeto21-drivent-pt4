import Joi from 'joi';
import { PostBookingBody, PutBookingParams } from '@/protocols';

export const postOrPutBookingBodySchema = Joi.object<PostBookingBody>({
  roomId: Joi.number().positive().integer().required(),
});

export const putBookingParamsSchema = Joi.object<PutBookingParams>({
  bookingId: Joi.number().positive().integer().required(),
});
