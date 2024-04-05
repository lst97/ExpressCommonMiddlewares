import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from '../../models/auth/JwtPayload';
import {
	DefinedBaseError,
	AuthAccessDeniedError,
	AuthAccessTokenMissingError,
	ServerInvalidEnvConfigError,
	IErrorHandlerService,
	IResponseService
} from '@lst97/common_response';
import { inject, injectable } from 'inversify';

/**
 * JwtMiddlewareService is a class that provides middleware functionality for verifying JWT tokens.
 *
 * @class JwtMiddlewareService
 * @constructor
 * @param {IErrorHandlerService} errorHandlerService - The error handler service.
 * @param {IResponseService} responseService - The response service.
 */
@injectable()
export class JwtMiddlewareService {
	private secret: string;

	constructor(
		@inject('ErrorHandlerService')
		private errorHandlerService: IErrorHandlerService,
		@inject('ResponseService') private responseService: IResponseService
	) {
		this.secret = process.env.ACCESS_TOKEN_SECRET as string;
		if (!this.secret || this.secret === '') {
			throw new ServerInvalidEnvConfigError({
				message: 'ACCESS_TOKEN_SECRET is not set in .env file.'
			});
		}
	}

	public verifyToken = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const authHeader = req.headers['authorization'];
		// Authorization: Bearer <token>
		const token = authHeader && authHeader.split(' ')[1];

		try {
			if (token == null) {
				throw new AuthAccessTokenMissingError({ request: req });
			}

			const decoded = await jwt.verify(token, this.secret);
			if (!decoded || typeof decoded === 'string') {
				throw new AuthAccessDeniedError({ request: req });
			}

			req.user = JwtPayload.fromObject(decoded);

			next();
		} catch (error) {
			if (error instanceof DefinedBaseError) {
				this.errorHandlerService.handleError({
					error: error,
					service: JwtMiddlewareService.name
				});

				const commonResponse = this.responseService.buildErrorResponse(
					error,
					req.headers.requestId as string
				);

				res.status(commonResponse.httpStatus).json(
					commonResponse.response
				);
			} else {
				this.errorHandlerService.handleUnknownError({
					error: error as Error,
					service: JwtMiddlewareService.name
				});

				const rootCause = this.errorHandlerService.getDefinedBaseError(
					req.headers.requestId as string
				)!;

				const commonResponse = this.responseService.buildErrorResponse(
					rootCause,
					req.headers.requestId as string
				);

				res.status(commonResponse.httpStatus).json(
					commonResponse.response
				);
			}
		}
	};
}
