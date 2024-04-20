import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { inversifyContainer } from "../../inversify.config";

export interface IResponseLoggerMiddlewareService {
  responseLogger(req: Request, res: Response, next: NextFunction): void;
}

/**
 * The ResponseLoggerMiddleware class represents the response logger middleware.
 * It is responsible for logging the response details.
 *
 * This should be last middleware to be called.
 *
 * @class
 */
@injectable()
export class ResponseLoggerMiddlewareService
  implements IResponseLoggerMiddlewareService
{
  public responseLogger(req: Request, res: Response, next: NextFunction) {
    next();

    res.on("finish", () => {
      const log = `[${new Date().toISOString()}] <- ${
        (req.headers.requestId as string).split(".")[2] ?? ""
      } (${req.method}) ${req.baseUrl} ${res.statusCode} - ${
        res.statusMessage
      } | IP: ${req.ip} |`;

      console.log(log);
    });
  }
}

export const ResponseLoggerMiddlewareServiceInstance = () =>
  inversifyContainer().get<IResponseLoggerMiddlewareService>(
    ResponseLoggerMiddlewareService,
  );
