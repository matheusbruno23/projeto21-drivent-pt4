import { conflictError, forbiddenError, notFoundError } from '@/errors';
import bookingsRepository from '@/repositories/booking-repository';
import hotelRepository from '@/repositories/hotels-repository';

async function roomIsFull(roomId: number) {
  const room = await hotelRepository.getRoomById(roomId);

  if (room === null) {
    throw notFoundError();
  }

  return room.Booking.length >= room.capacity;
}

async function getBookingFromUser(userId: number) {
  const booking = await bookingsRepository.getBookingFromUser(userId);

  if (booking === null) {
    throw notFoundError();
  }

  return booking;
}

async function setBookingForUser(userId: number, roomId: number) {
  const existingBooking = await bookingsRepository.getBookingFromUser(userId);

  if (existingBooking !== null) {
    throw conflictError('There is already a booking for this user');
  }

  if (await roomIsFull(roomId)) {
    throw forbiddenError('This room is already full');
  }

  return bookingsRepository.setBookingForUser(userId, roomId);
}

async function updateBookingRoom(userId: number, bookingId: number, newRoomId: number) {
  const existingBooking = await bookingsRepository.getBookingFromUser(userId);

  if (existingBooking === null) {
    throw forbiddenError('No booking for this user');
  }

  if (existingBooking.id !== bookingId) {
    throw forbiddenError('Could not edit booking not owned by authorized user');
  }

  if (await roomIsFull(newRoomId)) {
    throw forbiddenError('This room is already full');
  }

  return bookingsRepository.updateBookingRoom(bookingId, newRoomId);
}

const bookingService = { getBookingFromUser, setBookingForUser, updateBookingRoom };

export default bookingService;
