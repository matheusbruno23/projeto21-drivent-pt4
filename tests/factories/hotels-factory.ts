import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel({ roomCapacity = faker.datatype.number() } = {}) {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
      Rooms: { create: { name: faker.word.noun(), capacity: roomCapacity } },
    },
    include: { Rooms: true },
  });
}
