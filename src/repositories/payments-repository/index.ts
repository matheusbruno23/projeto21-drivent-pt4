import { prisma } from '@/config';

async function getPaymentFromTicket(ticketId: number) {
  return prisma.payment.findFirst({ where: { ticketId } });
}

async function createPayment(ticketId: number, value: number, cardIssuer: string, cardLastDigits: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'PAID', Payment: { create: { value, cardIssuer, cardLastDigits } } },
    include: { Payment: true },
  });
}

const paymentsRepository = {
  getPaymentFromTicket,
  createPayment,
};

export default paymentsRepository;
