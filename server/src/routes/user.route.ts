import { NextFunction, Request, Response, Router } from "express";
import { catchAsync } from "../common/lib";
import { celebrate } from "celebrate";
import { UserController } from "../controllers/user.controller";
import { convertBigIntToString } from "../common/lib/customeobj";

const route = Router();

export default (app: Router) => {
  app.use("/user", route);

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

  // route.get("/commission-hierarchy/:userId", (req, res) => {
  //   const userController = new UserController();
  //   userController.getCommissionHierarchy(req, res);
  // });
};
