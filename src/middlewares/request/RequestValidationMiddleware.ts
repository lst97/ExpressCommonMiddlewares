import { NextFunction, Request, Response } from 'express';
import { IErrorHandlerService, IResponseService } from '@lst97/common_response';
import {
	DefinedBaseError,
	ValidateRequestFormError,
	ValidateRequestParamError,
	ValidationError
} from '@lst97/common_response';
import Joi from 'joi';
import { ValidateRequestQueryError } from '@lst97/common_response';
import container from '../../inversify.config';
import { injectable } from 'inversify';

interface ValidationStrategy {
	validate(req: Request): ValidationResult;
}

interface ValidationResult {
	isValid: boolean;
	value?: any;
	errors?: DefinedBaseError[];
}

/**
 * Represents a validation strategy for validating request body.
 */
export class RequestBodyValidationStrategy implements ValidationStrategy {
	/**
	 * Creates an instance of RequestBodyValidationStrategy.
	 * @param schema - The Joi schema used for validation.
	 */
	constructor(private schema: Joi.ObjectSchema) {}

	/**
	 * Validates the request body.
	 * @param req - The request object.
	 * @returns The validation result.
	 */
	validate(req: Request): ValidationResult {
		const { error, value } = this.schema.validate(req.body, {
			abortEarly: false
		});

		if (error) {
			return {
				isValid: false,
				errors: error.details.map(
					(err) => new ValidateRequestFormError(err.message)
				)
			};
		} else {
			return { isValid: true, value };
		}
	}
}

/**
 * Represents a validation strategy for request parameters.
 */
export class RequestParamValidationStrategy implements ValidationStrategy {
	/**
	 * Creates an instance of RequestParamValidationStrategy.
	 * @param schema - The Joi schema used for validation.
	 */
	constructor(private schema: Joi.ObjectSchema) {}

	/**
	 * Validates the request parameters.
	 * @param req - The request object.
	 * @returns The validation result.
	 */
	validate(req: Request): ValidationResult {
		const { error, value } = this.schema.validate(req.params, {
			abortEarly: true
		});

		if (error) {
			return {
				isValid: false,
				errors: error.details.map(
					(err) => new ValidateRequestParamError(err.message)
				)
			};
		} else {
			return { isValid: true, value };
		}
	}
}

/**
 * Represents a validation strategy for request query parameters.
 */
export class RequestQueryValidationStrategy implements ValidationStrategy {
	/**
	 * Creates an instance of RequestQueryValidationStrategy.
	 * @param schema - The Joi schema used for validation.
	 */
	constructor(private schema: Joi.ObjectSchema) {}

	/**
	 * Validates the request query parameters.
	 * @param req - The request object.
	 * @returns The validation result.
	 */
	validate(req: Request): ValidationResult {
		const { error, value } = this.schema.validate(req.query, {
			abortEarly: true
		});

		if (error) {
			return {
				isValid: false,
				errors: error.details.map(
					(err) => new ValidateRequestQueryError(err.message)
				)
			};
		} else {
			return { isValid: true, value };
		}
	}
}

@injectable()
class RequestValidationMiddleware {
	constructor() {}

	/**
	 * Middleware function that performs request validation using a specified validation strategy.
	 * @param strategy The validation strategy to use.
	 * @returns The middleware function.
	 */
	public requestValidator(strategy: ValidationStrategy) {
		return async (req: Request, res: Response, next: NextFunction) => {
			const errorHandlerService = container.get<IErrorHandlerService>(
				'ErrorHandlerService'
			);
			const responseService =
				container.get<IResponseService>('ResponseService');

			const result = strategy.validate(req);

			if (!result.isValid) {
				const errorMessage = result
					.errors!.map((error) => error.message)
					.join('\n');

				const validationError = new ValidationError({
					message: errorMessage,
					cause: result.errors![0]
				});

				errorHandlerService.handleError({
					error: validationError,
					service: RequestValidationMiddleware.name
				});

				const commonResponse = responseService.buildErrorResponse(
					validationError,
					req.headers.requestId as string
				);

				res.status(commonResponse.httpStatus).json(
					commonResponse.response
				);
			} else {
				next();
			}
		};
	}
}

export default RequestValidationMiddleware;
