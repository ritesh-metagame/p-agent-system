import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { CategoryService } from "../services/category.service";

class CategoryController {
  public static async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const categoryService = Container.get(CategoryService);
      const categories = await categoryService.getAllCategories();

      return categories;
    } catch (error) {
      next(error);
    }
  }
}

export { CategoryController };
