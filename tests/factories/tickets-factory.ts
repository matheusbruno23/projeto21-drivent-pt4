import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';

type TicketTypeFactoryConfig = {
  isRemote: boolean;
  includesHotel: boolean;
};

export async function createTicketType(
  config: TicketTypeFactoryConfig = {
    isRemote: faker.datatype.boolean(),
    includesHotel: faker.datatype.boolean(),
  },
) {
  return prisma.ticketType.create({
    data: {
      isRemote: config.isRemote,
      includesHotel: config.includesHotel,
      name: faker.name.findName(),
      price: faker.datatype.number(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}
