import { Router } from "express";
import TopPerformerController from "../controllers/top-performer.controller";
// import authenticateJwt from "../middleware/authenticate";
// import authorizeRoles from "../middleware/authorize";
import { UserRole } from "../common/config/constants";
import { catchAsync } from "../common/lib";

const router = Router();
const topPerformerController = new TopPerformerController();

export default (app: Router) => {
  app.use("/top-performers", router);

  //   router.get("/", (req, res) =>
  //     topPerformerController.getTopPerformers(req, res)
  //   );

  //   // Get transaction statistics
  //   router.get("/statistics", (req, res) =>
  //     topPerformerController.getTransactionStatistics(req, res)
  //   );

  // Admin endpoint to calculate top performers
  router.post(
    "/calculate",

    //   authorizeRoles([UserRole.SUPER_ADMIN]),
    (req, res, next) =>
      topPerformerController.calculateTopPerformers(req, res, next)
  );

  //   Get top performers by role (admin function)
  router.get(
    "/role/:role",
    //   authenticateJwt,
    //   authorizeRoles([UserRole.SUPER_ADMIN]),
    catchAsync(async (req, res, next) => {
      const response = await topPerformerController.getTopPerformersByRole(
        req,
        res,
        next
      );

      return res.status(200).json(response);
    })
  );

  //   // Trace agent hierarchy from a specific transaction
  //   router.get(
  //     "/trace-hierarchy/:transactionId",
  //     //   authenticateJwt,
  //     //   authorizeRoles([UserRole.SUPER_ADMIN, UserRole.OPERATOR]),
  //     (req, res) => topPerformerController.traceAgentHierarchy(req, res)
  //   );
};

// Get top performers for the currently logged-in user
