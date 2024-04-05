import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

class RequestHeaderConfig {
  private _appIdentifier: string;

  constructor(appIdentifier: string) {
    this._appIdentifier = appIdentifier;
  }

  public get appIdentifier(): string {
    return this._appIdentifier;
  }

  public set appIdentifier(appIdentifier: string) {
    this._appIdentifier = appIdentifier;
  }
}
export class RequestHeaderMiddleware {
  public static headerConfig: RequestHeaderConfig;
  public static requestId(req: Request, _res: Response, next: NextFunction) {
    req.headers.requestId = `${
      this.headerConfig.appIdentifier
    }.requestId.${uuidv4()}`;
    next();
  }
}
