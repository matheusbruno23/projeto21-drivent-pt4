import { prisma } from '@/config';

async function findMany() {
  return prisma.ticketType.findMany();
}

const ticketTypeRepository = {
  findMany,
};

export default ticketTypeRepository;
