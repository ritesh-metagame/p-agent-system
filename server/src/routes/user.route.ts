import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";
import { UserController } from "../controllers/user.controller";

const route = Router();

export default (app: Router) => {
  app.use("/user", route);

  // Define your routes here
  route.post(
    "/create",
    // celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.createUser(req, res, next);

      res.status(200).json(response);
    }) as any
  );
};
