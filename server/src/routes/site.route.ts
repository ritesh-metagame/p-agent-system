import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";
import { SiteController } from "../controllers/site.controller";

const route = Router();

export default (app: Router) => {
  app.use("/site", route);

  // Define your routes here
  route.post(
    "/create",
    // celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await SiteController.createSite(req, res, next);

      res.status(200).json(response);
    }) as any
  );

  route.get(
    "/",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await SiteController.getSites(req, res, next);

      res.status(200).json(response);
    }) as any
  );
};
