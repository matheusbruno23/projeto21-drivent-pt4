import { Response } from 'express';
import { AuthenticatedRequest, PostBookingRequest, PutBookingRequest } from '@/protocols';
import bookingService from '@/services/booking-service';

export async function getBookingController(req: AuthenticatedRequest, res: Response) {
  const booking = await bookingService.getBookingFromUser(req.userId);
  return res.send(booking);
}

export async function postBookingController(req: PostBookingRequest, res: Response) {
  const booking = await bookingService.setBookingForUser(req.userId, req.body.roomId);
  return res.send({ bookingId: booking.id });
}

export async function updateBookingRoomController(req: PutBookingRequest, res: Response) {
  const { roomId } = req.body;
  const bookingId = parseInt(req.params.bookingId);
  const booking = await bookingService.updateBookingRoom(req.userId, bookingId, roomId);
  return res.send({ bookingId: booking.id });
}
