import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import { createUser, createHotel, createEnrollmentWithAddress, createTicketType, createTicket } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createBooking } from '../factories/bookings-factory';
import app, { init } from '@/app';
import { prisma } from '@/config';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when there is no booking associated with user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and with booking data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = hotel.Rooms[0];
      const booking = await createBooking(user.id, room.id);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: booking.id,
          Room: { ...room, createdAt: room.createdAt.toISOString(), updatedAt: room.updatedAt.toISOString() },
        }),
      );
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when there is no enrollment associated with user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when there is no ticket associated with user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the associated ticket is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the associated ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: true, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the associated ticket does not include an hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: false });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the requested room is fully booked', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const userInHotel = await createUser();
      const hotel = await createHotel({ roomCapacity: 1 });
      const room = hotel.Rooms[0];
      await createBooking(userInHotel.id, room.id);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 when the requested room does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 400 when the body does not contain the roomId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({});

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when the roomId has an invalid format', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();
      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: faker.lorem.word() });

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 409 when there is already a booking for the user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = hotel.Rooms[0];
      await createBooking(user.id, room.id);
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.CONFLICT);
    });

    it('should respond with status 200 and create the booking in the database', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = hotel.Rooms[0];
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      const booking = await prisma.booking.findFirst({ where: { userId: user.id } });

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});

describe('PUT /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when the user have not booked any room yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel({ roomCapacity: 1 });
      const room = hotel.Rooms[0];
      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when the requested room is fully booked', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel({ roomCapacity: 1 });
      const room = hotel.Rooms[0];
      const booking = await createBooking(user.id, room.id);
      const userInFullHotel = await createUser();
      const fullHotel = await createHotel({ roomCapacity: 1 });
      const fullRoom = fullHotel.Rooms[0];
      await createBooking(userInFullHotel.id, fullRoom.id);
      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: fullRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when trying to put booking that does not belong to authorized user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel({ roomCapacity: 2 });
      const room = hotel.Rooms[0];
      await createBooking(user.id, room.id);
      const userInOtherHotel = await createUser();
      const otherHotel = await createHotel({ roomCapacity: 1 });
      const otherRoom = otherHotel.Rooms[0];
      const booking = await createBooking(userInOtherHotel.id, otherRoom.id);
      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 400 when the body does not contain the roomId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel({ roomCapacity: 1 });
      const room = hotel.Rooms[0];
      const booking = await createBooking(user.id, room.id);
      const userInOtherHotel = await createUser();
      const otherHotel = await createHotel({ roomCapacity: 2 });
      const otherRoom = otherHotel.Rooms[0];
      await createBooking(userInOtherHotel.id, otherRoom.id);
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({});

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when the roomId has an invalid format', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel({ roomCapacity: 1 });
      const room = hotel.Rooms[0];
      const booking = await createBooking(user.id, room.id);
      const userInOtherHotel = await createUser();
      const otherHotel = await createHotel({ roomCapacity: 2 });
      const otherRoom = otherHotel.Rooms[0];
      await createBooking(userInOtherHotel.id, otherRoom.id);
      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: faker.lorem.word() });

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 200 and update the booking in the database', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({ isRemote: false, includesHotel: true });
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel({ roomCapacity: 1 });
      const room = hotel.Rooms[0];
      const booking = await createBooking(user.id, room.id);
      const userInOtherHotel = await createUser();
      const otherHotel = await createHotel({ roomCapacity: 2 });
      const otherRoom = otherHotel.Rooms[0];
      await createBooking(userInOtherHotel.id, otherRoom.id);
      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: otherRoom.id });

      const updatedBooking = await prisma.booking.findFirst({ where: { userId: user.id } });

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(expect.objectContaining({ bookingId: expect.any(Number) }));
      expect(updatedBooking).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          roomId: otherRoom.id,
          userId: user.id,
        }),
      );
    });
  });
});
