import { Request, Response, NextFunction } from 'express';
import CustomError from './custom.error';
import { HTTPStatusCode } from './enum/http-status.code';
import { ErrorMessages } from './enum/error-messages.enum';

export const exceptionHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction // we won't be calling next() here
) => {
  const statusCode = error.statusCode || HTTPStatusCode.InternalServerError;
  const message = error.message || ErrorMessages.Generic;

  // logger

  return res.status(statusCode).send({ status: false, statusCode, message });
};