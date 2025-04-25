import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";
import { UserController } from "../controllers/user.controller";
import { convertBigIntToString } from "../common/lib/customeobj";
import { updateProfileSchema } from "../common/interfaces/user.interface";

const route = Router();

export default (app: Router) => {
  app.use("/user", route);

  route.post(
    "/download-report",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      // Remove res.json here — let the controller handle the response
      await UserController.getDownloadReportList(req, res, next);
    })
  );

  route.get(
    "/payoutAndWalletBalance",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.getPayoutAndWalletBalance(
        req,
        res,
        next
      );

      res.status(200).json(response);
    })
  );

  route.get(
    "/all",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.getAllUsers(req, res, next);

      res.status(200).json(response);
    })
  );

  // Define your routes here
  route.post(
    "/create",
    // celebrate({}),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.createUser(req, res, next);

      res.status(200).json(response);
    }) as any
  );

  route.get(
    "/partners",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.getPartners(req, res, next);

      res.status(200).json(response);
    })
  );

  route.get(
    "/transactions",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.getTransactionByCategory(
        req,
        res,
        next
      );
      const safeResponse = convertBigIntToString(response);
      res.status(200).json(safeResponse);
    })
  );

  route.get(
    "/transactionsByCategory",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.getTransactionByCategoryAndAgent(
        req,
        res,
        next
      );
      // const safeResponse = convertBigIntToString(response);
      res.status(200).json(response);
    })
  );

  route.get(
    "/:userId",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.getUserDetails(req, res, next);
      res.status(200).json(response);
    })
  );

  // route.get(
  //   "/:username",
  //   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //     const response = await UserController.getUserDetails(req, res, next);
  //     res.status(200).json(response);
  //   })
  // );

  // route.put(
  //   "/:username",
  //   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //     const response = await UserController.updateUser(req, res, next);
  //     res.status(200).json(response);
  //   })
  // );

  route.put(
    "/:userId/profile",
    celebrate({
      body: updateProfileSchema,
    }),
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.updateProfile(req, res, next);
      res.status(200).json(response);
    })
  );

  route.get(
    "/username/:username",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.getUserDetailsByUsername(
        req,
        res,
        next
      );
      res.status(200).json(response);
    })
  );

  route.put(
    "/username/:username",
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await UserController.updateUserByUsername(
        req,
        res,
        next
      );
      res.status(200).json(response);
    })
  );

  // route.get("/commission-hierarchy/:userId", (req, res) => {
  //   const userController = new UserController();
  //   userController.getCommissionHierarchy(req, res);
  // });
};
