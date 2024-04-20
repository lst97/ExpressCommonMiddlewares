import { useInversify as useCommonResponseInversify } from "@lst97/common_response";
import { Container } from "inversify";
import {
  IJwtMiddlewareService,
  JwtMiddlewareService,
} from "./middlewares/request/JwtMiddleware";
import {
  IRequestHeaderMiddlewareService,
  RequestHeaderMiddlewareService,
} from "./middlewares/request/RequestHeaderMiddleware";
import {
  IRequestLoggerMiddlewareService,
  RequestLoggerMiddlewareService,
} from "./middlewares/request/RequestLoggerMiddleware";
import {
  IRequestValidationMiddlewareService,
  RequestValidationMiddlewareService,
} from "./middlewares/request/RequestValidationMiddleware";
import {
  IResponseLoggerMiddlewareService,
  ResponseLoggerMiddlewareService,
} from "./middlewares/response/ResponseLoggerMiddleware";
/**
 * For the user to get the singleton instance of the services,
 * Support to use the provided container to build the services.
 * If not provided, it will create a new container for the services.
 * It makes use it use the singleton instance of the services.
 *
 */
export class Containers {
  private static _instance: Containers;
  private container: Container;

  private constructor() {
    this.container = new Container();
    this.buildContainers();
  }

  public static get instance() {
    if (!Containers._instance) {
      Containers._instance = new Containers();
    }
    return Containers._instance;
  }

  public get inversifyContainer() {
    return this.container;
  }

  private buildContainers() {
    this.buildConstantsContainer();
    this.buildLibContainers();
    this.buildServiceContainer();
  }

  private buildLibContainers() {
    useCommonResponseInversify(this.container);
  }

  // Arguments that required for the services
  private buildConstantsContainer() {}
  private buildServiceContainer() {
    if (!this.container.isBound(JwtMiddlewareService)) {
      this.container
        .bind<IJwtMiddlewareService>(JwtMiddlewareService)
        .toSelf()
        .inSingletonScope();
    }

    if (!this.container.isBound(RequestHeaderMiddlewareService)) {
      this.container
        .bind<IRequestHeaderMiddlewareService>(RequestHeaderMiddlewareService)
        .toSelf()
        .inSingletonScope();
    }

    if (!this.container.isBound(RequestLoggerMiddlewareService)) {
      this.container
        .bind<IRequestLoggerMiddlewareService>(RequestLoggerMiddlewareService)
        .toSelf()
        .inSingletonScope();
    }

    if (!this.container.isBound(RequestValidationMiddlewareService)) {
      this.container
        .bind<IRequestValidationMiddlewareService>(
          RequestValidationMiddlewareService,
        )
        .toSelf()
        .inSingletonScope();
    }

    if (!this.container.isBound(ResponseLoggerMiddlewareService)) {
      this.container
        .bind<IResponseLoggerMiddlewareService>(ResponseLoggerMiddlewareService)
        .toSelf()
        .inSingletonScope();
    }
  }

  public useInversify(container: Container) {
    // use the user provided container to build the middleware containers
    this.container = container;
    this.buildContainers();
  }
}

export const useInversify = (container: Container) => {
  Containers.instance.useInversify(container);
};

/**
 * For internal use only.
 * @returns the singleton instance of the container
 */
export const inversifyContainer = () => {
  return Containers.instance.inversifyContainer;
};
