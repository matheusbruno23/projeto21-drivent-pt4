import { prisma } from '@/config';

async function listHotels() {
  return prisma.hotel.findMany({ include: { Rooms: true } });
}

async function getHotelById(hotelId: number) {
  return prisma.hotel.findUnique({ where: { id: hotelId }, include: { Rooms: true } });
}

async function getRoomById(roomId: number) {
  return prisma.room.findUnique({ where: { id: roomId }, include: { Booking: true } });
}

const hotelRepository = { listHotels, getHotelById, getRoomById };

export default hotelRepository;
