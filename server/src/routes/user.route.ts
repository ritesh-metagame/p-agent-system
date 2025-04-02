import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";

const route = Router();

export default (app: Router) => {
  app.use("/user", route);

  // Define your routes here
  route.post(
    "/create",
    celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      // const response = await AuthController.login(req, res, next);

      res.status(200).json(response);
    }) as any
  );
};
