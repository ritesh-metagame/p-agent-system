import { Service } from "typedi";
import { Category } from "../../prisma/generated/prisma";
import { CategoryDao } from "../daos/category.dao";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";

@Service()
class CategoryService {
  private categoryDao: CategoryDao; // Replace with actual DAO class if needed

  // Define any properties or methods needed for the CategoryService here
  constructor() {
    // Initialize any dependencies or properties if needed
    this.categoryDao = new CategoryDao(); // Initialize the DAO instance
  }

  // Example method to create a category (you can modify this as per your requirements)
  public async createCategory(categoryData: Partial<Category>) {
    try {
      // Logic to create a category using the provided data
      // For example, you might call a DAO method here to interact with the database

      const createdCategory =
        await this.categoryDao.createCategory(categoryData); // Call DAO method

      return createdCategory; // Return the created category data
    } catch (error) {
      throw new Error(`Error creating category: ${error}`);
    }
  }

  // Example method to get all categories (you can modify this as per your requirements)
  public async getAllCategories() {
    try {
      // Logic to fetch all categories using the DAO
      const categories = await this.categoryDao.getAllCategories(); // Call DAO method

      return new Response(
        ResponseCodes.CATEGORIES_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.CATEGORIES_FETCHED_SUCCESSFULLY.message,
        categories
      ); // Return the fetched categories
    } catch (error) {
      throw new Error(`Error fetching categories: ${error}`);
    }
  }
}

export { CategoryService };
