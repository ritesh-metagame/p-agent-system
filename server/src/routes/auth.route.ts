import { NextFunction, Request, Response, Router } from "express";
import getLogger from "../common/logger";
import { celebrate, Segments } from "celebrate";
import { catchAsync } from "../common/lib";
import { loginSchema } from "../common/interfaces/auth.interface";
import { AuthController } from "../controllers/auth.controller";

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
  app.use("/auth", route);

  route.post(
    "/login",
    celebrate({
      [Segments.BODY]: loginSchema,
    }),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await AuthController.login(req, res, next);

      res.status(200).json(response);
    })
  );
};
