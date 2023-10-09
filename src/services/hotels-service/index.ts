import { notFoundError } from '@/errors';
import hotelRepository from '@/repositories/hotels-repository';

async function listHotels() {
  const hotels = await hotelRepository.listHotels();

  if (hotels.length === 0) {
    throw notFoundError();
  }

  return hotels;
}

async function getHotelById(hotelId: number) {
  const hotel = await hotelRepository.getHotelById(hotelId);

  if (hotel === null) {
    throw notFoundError();
  }

  return hotel;
}

const hotelsService = { listHotels, getHotelById };

export default hotelsService;
