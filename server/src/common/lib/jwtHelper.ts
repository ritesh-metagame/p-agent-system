import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { Role } from "../../../prisma/generated/prisma";

export type Payload = {
  id?: string;
  username?: string;
  role?: Role;
};

class JWTService {
  private static expiresInSeconds(days: number): number {
    return days * 24 * 60 * 60;
  }

  public static assignToken(
    payload: Payload,
    secret: string,
    expiresIn: string
  ): string {
    return jwt.sign(payload, secret, {
      expiresIn: this.expiresInSeconds(parseInt(expiresIn?.split("d")[0]!)),
    });
  }

  public static decodeToken(
    token: string,
    secret: string
  ): Promise<string | JwtPayload | any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });
  }
}

export { JWTService };
