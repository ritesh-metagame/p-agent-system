import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";

class TransactionController {
  private service: TransactionService;

  constructor() {
    this.service = new TransactionService();
  }

  /**
   * Get list of transaction reports for the UI table
   * Accepts optional startDate and endDate query parameters
   */
  public getTransactionReports = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const serviceResponse = await this.service.getTransactionReports(
        startDate as string | undefined,
        endDate as string | undefined
      );
      return serviceResponse;
    } catch (error: any) {
      return {
        code: "400",
        message: error.message || "Error getting transaction reports",
        data: null,
      };
    }
  };

  /**
   * Export transactions as CSV file
   */
  public exportTransactions = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, format } = req.query;

      if (!startDate || !endDate) {
        return {
          code: "400",
          message: "Both startDate and endDate are required query parameters",
          data: null,
        };
      }

      const serviceResponse = await this.service.getTransactionData(
        startDate as string,
        endDate as string
      );

      return serviceResponse;
    } catch (error: any) {
      return {
        code: "400",
        message: error.message || "Error exporting transactions",
        data: null,
      };
    }
  };
}

export { TransactionController };
