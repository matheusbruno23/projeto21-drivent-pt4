import { ApplicationError } from '@/protocols';

export function paymentRequiredError(): ApplicationError {
  return {
    name: 'PaymentRequiredError',
    message:
      'Hotels are only available to paid tickets that are not of remote type and includes a hotel booking in the order',
  };
}
