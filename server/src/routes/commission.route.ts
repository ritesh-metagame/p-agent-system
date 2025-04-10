import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";
import { CommissionController } from "../controllers/commission.controller";

const route = Router();

export default (app: Router) => {
  app.use("/commission", route);

  route.post(
    "/commissionByCategory",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.commissionByCategory(
        req,
        res,
        next
      );
      if (response) {
        res.status(200).json(response);
      }
    })
  );

  route.post(
    "/create",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.createCommission(
        req,
        res,
        next
      );
      if (response) {
        res.status(200).json(response);
      }
    })
  );

  route.get(
    "/summaries",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.getCommissionSummaries(
        req,
        res,
        next
      );
      if (response) {
        res.status(200).json(response);
      }
    })
  );

  route.get(
    "/payout-report",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.getCommissionPayoutReport(
        req,
        res,
        next
      );
      if (response) {
        res.status(200).json(response);
      }
    })
  );

  route.post(
    "/running-tally",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.getRunningTally(
        req,
        res,
        next
      );
      if (response) {
        res.status(200).json(response);
      }
    })
  );
};
