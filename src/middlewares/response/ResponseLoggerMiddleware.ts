import { NextFunction } from 'express';
import { Request } from 'express';
import { Response } from 'express';

/**
 * The ResponseLoggerMiddleware class represents the response logger middleware.
 * It is responsible for logging the response details.
 *
 * This should be last middleware to be called.
 *
 * @class
 */
class ResponseLoggerMiddleware {
	public static responseLogger(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		next();

		res.on('finish', () => {
			const log = `[${new Date().toISOString()}] <- ${
				(req.headers.requestId as string).split('.')[2] ?? ''
			} (${req.method}) ${req.baseUrl} ${res.statusCode} - ${
				res.statusMessage
			} | IP: ${req.ip} |`;

			console.log(log);
		});
	}
}

export default ResponseLoggerMiddleware;
