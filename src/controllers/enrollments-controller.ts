import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/protocols';
import enrollmentsService from '@/services/enrollments-service';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  try {
    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...req.body,
      userId: req.userId,
    });

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

type RequestWithCEPQuery = {
  query: {
    cep: string;
  };
};

export async function getAddressFromCEP(req: AuthenticatedRequest & RequestWithCEPQuery, res: Response) {
  const { cep } = req.query;

  try {
    const address = await enrollmentsService.getAddressFromCEP(cep);
    res.status(httpStatus.OK).send(address);
  } catch (error) {
    if (error.name === 'NotFoundError' || error.name === 'RequestError') {
      return res.sendStatus(httpStatus.NO_CONTENT);
    }
  }
}
