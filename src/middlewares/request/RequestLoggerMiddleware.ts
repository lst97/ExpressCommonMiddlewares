import { NextFunction, Request, Response } from 'express';

/**
 * The RequestLoggerMiddleware class represents the request logger middleware.
 * It is responsible for logging the request details.
 *
 * @class
 */
export class RequestLoggerMiddleware {
	public static requestLogger(
		req: Request,
		_res: Response,
		next: NextFunction
	) {
		console.log(
			`[${new Date().toISOString()}] -> ${
				(req.headers.requestId as string).split('.')[2] ?? ''
			} (${req.method}) ${req.originalUrl} | IP: ${req.ip} |`
		);
		next();
	}
}
