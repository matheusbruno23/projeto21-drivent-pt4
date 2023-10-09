import { prisma } from '@/config';

async function getBookingFromUser(userId: number) {
  return prisma.booking.findFirst({ where: { userId }, include: { Room: true } });
}

async function setBookingForUser(userId: number, roomId: number) {
  return prisma.booking.create({ data: { userId, roomId } });
}

async function updateBookingRoom(bookingId: number, newRoomId: number) {
  return prisma.booking.update({ where: { id: bookingId }, data: { roomId: newRoomId } });
}

const bookingsRepository = { getBookingFromUser, setBookingForUser, updateBookingRoom };

export default bookingsRepository;
