import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";
import { inversifyContainer } from "../../inversify.config";

export class Config {
  private static _instance: Config;
  private _appIdentifier: string = "unknown";
  private _requestIdName: string = "requestId";

  private constructor() {}

  public static get instance() {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }

  public get appIdentifier(): string {
    return this._appIdentifier;
  }

  public set appIdentifier(appIdentifier: string) {
    this._appIdentifier = appIdentifier;
  }

  public get requestIdName(): string {
    return this._requestIdName;
  }

  public set requestIdName(requestIdName: string) {
    this._requestIdName = requestIdName;
  }
}
export interface IRequestHeaderMiddlewareService {
  requestId(req: Request, res: Response, next: NextFunction): void;
}
@injectable()
export class RequestHeaderMiddlewareService
  implements IRequestHeaderMiddlewareService
{
  public requestId(req: Request, _res: Response, next: NextFunction) {
    req.headers.requestId = `${Config.instance.appIdentifier}.${
      Config.instance.requestIdName
    }.${uuidv4()}`;
    next();
  }
}

export const RequestHeaderMiddlewareServiceInstance = () =>
  inversifyContainer().get<IRequestHeaderMiddlewareService>(
    RequestHeaderMiddlewareService,
  );
