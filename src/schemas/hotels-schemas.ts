import Joi from 'joi';
import { GetHotelByIdParams } from '@/protocols';

export const getHotelByIdSchema = Joi.object<GetHotelByIdParams>({
  hotelId: Joi.number().positive().integer().required(),
});
