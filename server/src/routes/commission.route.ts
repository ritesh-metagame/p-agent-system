import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";
import { CommissionController } from "../controllers/commission.controller";

const route = Router();

export default (app: Router) => {
  app.use("/commission", route);

  route.post(
    "/topPerformer",
    // celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.topPerformer(req, res, next);

      res.status(200).json(response);
    }) as any
  );

  route.post(
    "/commissionByCategory",
    // celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.commissionByCategory(
        req,
        res,
        next
      );

      res.status(200).json(response);
    }) as any
  );

  // Define your routes here
  route.post(
    "/create",
    // celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.createCommission(
        req,
        res,
        next
      );

      res.status(200).json(response);
    }) as any
  );

  route.get(
    "/getTotalCommissionByUser",
    // celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.getTotalCommissionByUser(
        req,
        res,
        next
      );

      res.status(200).json(response);
    }) as any
  );
};
