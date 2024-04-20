import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { inversifyContainer } from "../../inversify.config";

export interface IRequestLoggerMiddlewareService {
  requestLogger(req: Request, res: Response, next: NextFunction): void;
}

/**
 * The RequestLoggerMiddleware class represents the request logger middleware.
 * It is responsible for logging the request details.
 *
 * @class
 */
@injectable()
export class RequestLoggerMiddlewareService
  implements IRequestLoggerMiddlewareService
{
  public requestLogger(req: Request, _res: Response, next: NextFunction) {
    console.log(
      `[${new Date().toISOString()}] -> ${
        (req.headers.requestId as string).split(".")[2] ?? ""
      } (${req.method}) ${req.originalUrl} | IP: ${req.ip} |`,
    );
    next();
  }
}

export const RequestLoggerMiddlewareServiceInstance = () =>
  inversifyContainer().get<IRequestLoggerMiddlewareService>(
    RequestLoggerMiddlewareService,
  );
