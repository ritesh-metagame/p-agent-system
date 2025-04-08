import { Router } from "express";
import { NetworkStatisticsController } from "../controllers/network-statistics.controller";
// import { authenticateJwt } from "../common/middlewares/jwt.middleware";

const router: Router = Router();
const networkStatisticsController = new NetworkStatisticsController();

export default (app: Router) => {
  app.use("/network-statistics", router);

  /**
   * @route   GET /api/network-statistics
   * @desc    Get network statistics based on user role
   * @access  Private
   */
  router.get("/", networkStatisticsController.getNetworkStatistics);

  /**
   * @route   POST /api/network-statistics/calculate
   * @desc    Calculate and update network statistics
   * @access  Private
   */
  router.post(
    "/calculate",
    networkStatisticsController.calculateAndUpdateNetworkStatistics
  );
};

// export default router;
