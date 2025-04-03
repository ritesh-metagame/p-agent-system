import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { RoleController } from "../controllers/role.controller";

const route = Router();

export default (app: Router) => {
  app.use("/role", route);

  route.get(
    "/",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await RoleController.getRoles(req, res, next);

      res.status(200).json(response);
    }) as any
  );
};
