import { JwtPayload } from "../../auth/JwtPayload";

export {};

declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload;
      id: string;
    }
  }
}
