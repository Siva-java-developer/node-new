import { Request, Response, NextFunction } from 'express';
import { HTTPStatusCode } from './enum/http-status.code';
import { ErrorMessages } from './enum/error-messages.enum';

export const pageNotFoundExceptionHandler = (
  req: Request,
  res: Response,
  _next: NextFunction // we won't be calling next() here
) => {
  const statusCode = HTTPStatusCode.NotFound;
  const message = ErrorMessages.NotFound;
  // logger

  return res.status(HTTPStatusCode.NotFound).send({ status: false, statusCode,  message});
};