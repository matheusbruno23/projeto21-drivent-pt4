import { Request } from 'express';

export type ApplicationError = {
  name: string;
  message: string;
};

export type RequestError = {
  status: number;
  data: object | null;
  statusText: string;
  name: string;
  message: string;
};

export type JWTPayload = {
  userId: number;
};

export type AuthenticatedRequest = Request & JWTPayload;

export type ViaCEPAddress = {
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type ViaCEPResponseSuccess = {
  logradouro: string;
  complemento: string;
  bairro: string;
  uf: string;
  localidade: string;
  cep: string;
  ibge: string;
  ddd: string;
  siafi: string;
};

export type ViaCEPResponseError = {
  erro: boolean;
};

export type ViaCEPResponse = ViaCEPResponseSuccess | ViaCEPResponseError;

export type CreateTicketBody = {
  ticketTypeId: number;
};

export interface CreateTicketRequest extends AuthenticatedRequest {
  body: CreateTicketBody;
}

export type GetPaymentQuery = {
  ticketId: string;
};

export interface GetPaymentRequest extends AuthenticatedRequest {
  query: GetPaymentQuery;
}

export type CardData = {
  issuer: string;
  number: number;
  name: string;
  expirationDate: Date;
  cvv: number;
};

export type ProcessPaymentBody = {
  ticketId: number;
  cardData: CardData;
};

export interface ProcessPaymentRequest extends AuthenticatedRequest {
  body: ProcessPaymentBody;
}

export type GetHotelByIdParams = {
  hotelId: string;
};

export interface GetHotelByIdRequest extends AuthenticatedRequest {
  params: GetHotelByIdParams;
}

export type PostBookingBody = {
  roomId: number;
};

export interface PostBookingRequest extends AuthenticatedRequest {
  body: PostBookingBody;
}

export type PutBookingParams = {
  bookingId: string;
};

export interface PutBookingRequest extends PostBookingRequest {
  params: PutBookingParams;
}
