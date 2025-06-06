import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";

const transactionRoute = (router: Router) => {
  const controller = new TransactionController();

  // GET /api/transactions/reports - Optional query parameters: startDate and endDate
  router.get("/transactions/reports", (req, res) => {
    controller
      .getTransactionReports(req, res)
      .then((response) => res.json(response))
      .catch((error) =>
        res.status(500).json({
          code: "500",
          message: error.message || "Internal server error",
          data: null,
        })
      );
  });

  // GET /api/transactions/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=csv
  router.get("/transactions/export", (req, res) => {
    controller
      .exportTransactions(req, res)
      .then((response) => {
        const { startDate, endDate, format } = req.query;

        // Handle CSV file download if format is csv
        if (format === "csv") {
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=transactions-${startDate}-to-${endDate}.csv`
          );
          return res.send(response.data.csvContent);
        }

        // Otherwise return JSON
        return res.json(response);
      })
      .catch((error) =>
        res.status(500).json({
          code: "500",
          message: error.message || "Internal server error",
          data: null,
        })
      );
  });
};

export default transactionRoute;
