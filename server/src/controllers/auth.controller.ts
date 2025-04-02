import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { AuthService } from "../services/auth.service";

class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Your login logic here
      const { username, password } = req.body;

      const authService = Container.get(AuthService);

      const response = await authService.login({ username, password });

      return response;
    } catch (error) {
      next(error);
    }
  }
}

export { AuthController };
