import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { CategoryController } from "../controllers/category.controller";

const route = Router();
export default (app: Router) => {
  app.use("/category", route);

  // Define your routes here
  route.get(
    "/",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CategoryController.getCategories(req, res, next);

      res.status(200).json(response);
    }) as any
  );

  // route.post(
  //     "/create",
  //     celebrate({}),
  //     catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //     const response = await CategoryController.createCategory(req, res, next);

  //     res.status(200).json(response);
  //     }) as any
  // );
};
