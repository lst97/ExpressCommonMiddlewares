import { NextFunction, Request, Response } from "express";
import {
  ErrorHandlerService,
  IErrorHandlerService,
  IResponseService,
  ResponseService,
} from "@lst97/common_response";
import {
  DefinedBaseError,
  ValidateRequestFormError,
  ValidateRequestParamError,
  ValidateRequestQueryError,
  ValidationError,
} from "@lst97/common-errors";
import Joi from "joi";
import { injectable } from "inversify";
import { inversifyContainer } from "../../inversify.config";

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
      abortEarly: false,
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map(
          (err) => new ValidateRequestFormError(err.message),
        ),
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
      abortEarly: true,
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map(
          (err) => new ValidateRequestParamError(err.message),
        ),
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
      abortEarly: true,
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map(
          (err) => new ValidateRequestQueryError(err.message),
        ),
      };
    } else {
      return { isValid: true, value };
    }
  }
}

export interface IRequestValidationMiddlewareService {
  requestValidator(
    strategy: ValidationStrategy,
  ): (req: Request, res: Response, next: NextFunction) => void;
}
@injectable()
export class RequestValidationMiddlewareService
  implements IRequestValidationMiddlewareService
{
  /**
   * Middleware function that performs request validation using a specified validation strategy.
   * @param strategy The validation strategy to use.
   * @returns The middleware function.
   */
  public requestValidator(strategy: ValidationStrategy) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const errorHandlerService =
        inversifyContainer().get<IErrorHandlerService>(ErrorHandlerService);
      const responseService =
        inversifyContainer().get<IResponseService>(ResponseService);

      const result = strategy.validate(req);

      if (!result.isValid) {
        const errorMessage = result
          .errors!.map((error) => error.message)
          .join("\n");

        const validationError = new ValidationError({
          message: errorMessage,
          cause: result.errors![0],
        });

        errorHandlerService.handleError({
          error: validationError,
          service: RequestValidationMiddlewareService.name,
        });

        const commonResponse = responseService.buildErrorResponse(
          validationError,
          req.headers.requestId as string,
        );

        res.status(commonResponse.httpStatus).json(commonResponse.response);
      } else {
        next();
      }
    };
  }
}

export const RequestValidationMiddlewareServiceInstance = () =>
  inversifyContainer().get<IRequestValidationMiddlewareService>(
    RequestValidationMiddlewareService,
  );
