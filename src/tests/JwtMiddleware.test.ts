import { NextFunction, Request, Response } from "express";
import { inversifyContainer } from "../inversify.config";
import {
  IJwtMiddlewareService,
  JwtMiddlewareService,
} from "../middlewares/request/JwtMiddleware";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../models/auth/JwtPayload";
import { IErrorHandlerService } from "@lst97/common_response";
jest.mock("jsonwebtoken"); // Mock the jsonwebtoken library

describe("JwtMiddlewareService", () => {
  let service: IJwtMiddlewareService;
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;
  let errorHandlerServiceMock: IErrorHandlerService;

  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = "your_secret_key";
    process.env.BCRYPT_SALT_ROUNDS = "1";

    // Set up mocks and service instance
    mockRequest = { headers: {} } as Request;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    mockNext = jest.fn();
    errorHandlerServiceMock = {
      handleError: jest.fn(),
      handleUnknownError: jest.fn(),
      getDefinedBaseError: jest.fn(),
      removeErrorFromChain: jest.fn(),
      getRootCause: jest.fn(),
      handleUnknownDatabaseError: jest.fn(),
      handleUnknownServiceError: jest.fn(),
      handleUnknownControllerError: jest.fn(),
      handleUnknownServerError: jest.fn(),
    };

    service =
      inversifyContainer().get<IJwtMiddlewareService>(JwtMiddlewareService);
    // Mock dependencies here (ErrorHandlerService, ResponseService)
  });

  describe("verifyToken", () => {
    it("should call next if valid token is provided", async () => {
      // Mock JWT verification to return a valid payload object
      const mockPayload = {
        id: "testuser_id",
        username: "testuser",
        email: "test@example.com",
        role: "admin",
        permission: "full_access",
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockRequest.headers.authorization = "Bearer valid_token";

      service.verifyToken(mockRequest, mockResponse, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid_token",
        expect.any(String),
      );
      expect(mockRequest.user).toBeInstanceOf(JwtPayload); // Check instance
      expect(mockRequest.user).toEqual(
        // Check properties using toEqual to compare object contents
        new JwtPayload({
          id: "testuser_id",
          username: "testuser",
          email: "test@example.com",
          role: "admin",
          permission: "full_access",
        }),
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw an AuthAccessTokenMissingError if the token is missing", () => {
      // Arrange

      const responseServiceMock = {
        buildErrorResponse: jest.fn().mockReturnValue({
          httpStatus: 401,
          response: { message: "Access token missing" },
        }),
        buildSuccessResponse: jest.fn(),
      };

      const jwtMiddlewareService = new JwtMiddlewareService(
        errorHandlerServiceMock,
        responseServiceMock,
      );

      // Act
      jwtMiddlewareService.verifyToken(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access token missing",
      });
    });

    // it("should throw error if token is invalid", async () => {
    //   // Arrange
    //   const req = {
    //     headers: {
    //       authorization: "Bearer invalidToken",
    //       requestId: "requestId",
    //     },
    //   } as unknown as Request;

    //   const responseServiceMock = {
    //     buildErrorResponse: jest.fn().mockReturnValue({
    //       httpStatus: 401,
    //       response: { message: "Access token missing" },
    //     }),
    //     buildSuccessResponse: jest.fn(),
    //   };

    //   const jwtMiddlewareService = new JwtMiddlewareService(
    //     errorHandlerServiceMock,
    //     responseServiceMock
    //   );

    //   // Act
    //   jwtMiddlewareService.verifyToken(req, mockResponse, mockNext);

    //   // Assert
    //   expect(mockNext).not.toHaveBeenCalled();
    //   expect(mockResponse.status).toHaveBeenCalledWith(401);
    //   expect(mockResponse.json).toHaveBeenCalledWith({
    //     message: "Access token missing",
    //   });
    // });
  });
});
