import { Response } from 'express';
import { AuthenticatedRequest, GetHotelByIdRequest } from '@/protocols';
import hotelsService from '@/services/hotels-service';

export async function listHotelsController(req: AuthenticatedRequest, res: Response) {
  const hotels = await hotelsService.listHotels();
  return res.send(hotels);
}

export async function getHotelByIdController(req: GetHotelByIdRequest, res: Response) {
  const hotelId = Number(req.params.hotelId);
  const hotel = await hotelsService.getHotelById(hotelId);
  return res.send(hotel);
}
