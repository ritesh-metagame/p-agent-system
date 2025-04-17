import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";
import { CommissionController } from "../controllers/commission.controller";

const route = Router();

export default (app: Router) => {
  app.use("/commission", route);

  // route.post(
  //   "/topPerformer",
  //   // celebrate({}),
  //   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //     const response = await CommissionController.topPerformer(req, res, next);

  //     res.status(200).json(response);
  //   }) as any
  // );
  route.put(
    "/update-unsettled-commission",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.markSettledCommission(
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
    "/unsettled-commission",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.gteUnsettledCommission(
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
    "/payment-gateway-fees",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await CommissionController.getPaymentGatewayFees(
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
      try {
        const response = await CommissionController.getCommissionSummaries(
          req,
          res,
          next
        );
        if (!res.headersSent && response) {
          return res.status(200).json(response);
        }
      } catch (error) {
        if (!res.headersSent) {
          next(error);
        }
      }
    })
  );

  route.get(
    "/payout-report",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { categoryId, userId } = req.query;
        const response = await CommissionController.getCommissionPayoutReport(
          req,
          res,
          next
        );
        if (!res.headersSent && response) {
          return res.status(200).json(response);
        }
      } catch (error) {
        if (!res.headersSent) {
          next(error);
        }
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

  route.get(
    "/pending-settlements",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await CommissionController.getPendingSettlements(
          req,
          res,
          next
        );
        if (!res.headersSent && response) {
          return res.status(200).json(response);
        }
      } catch (error) {
        if (!res.headersSent) {
          next(error);
        }
      }
    })
  );

  route.get(
    "/total-breakdown",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await CommissionController.getTotalBreakdown(
          req,
          res,
          next
        );
        if (!res.headersSent && response) {
          return res.status(200).json(response);
        }
      } catch (error) {
        if (!res.headersSent) {
          next(error);
        }
      }
    })
  );

  // Replace the separate breakdown routes with a single unified endpoint
  route.get(
    "/breakdown",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await CommissionController.getBreakdown(req, res, next);
        // Only send response if one hasn't been sent already
        if (!res.headersSent) {
          return res.json(result);
        }
      } catch (error) {
        if (!res.headersSent) {
          next(error);
        }
      }
    })
  );

  route.get(
    "/license-breakdown",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await CommissionController.getLicenseBreakdown(
          req,
          res,
          next
        );
        if (!res.headersSent && response) {
          return res.status(200).json(response);
        }
      } catch (error) {
        if (!res.headersSent) {
          next(error);
        }
      }
    })
  );
};
