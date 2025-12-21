import jwt from "jsonwebtoken";

export class TokenService {
  static sign(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
  }

  static verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}
