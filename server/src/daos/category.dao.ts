import { prisma } from "../server";

class CategoryDao {
  constructor() {
    // Initialize the DAO
  }

  async getAllCategories() {
    // Logic to fetch all categories from the database
    try {
      const categories = await prisma.category.findMany({});

      return categories;
    } catch (error) {
      throw new Error(`Error fetching categories: ${error}`);
    }
  }

  async getCategoryById(id) {
    // Logic to fetch a category by ID from the database
    try {
      const category = await prisma.category.findUnique({
        where: { id },
      });

      return category;
    } catch (error) {
      throw new Error(`Error fetching category: ${error}`);
    }
  }

  async createCategory(categoryData) {
    // Logic to create a new category in the database
  }

  async updateCategory(id, categoryData) {
    // Logic to update an existing category in the database
  }

  async deleteCategory(id) {
    // Logic to delete a category from the database
  }
}

export { CategoryDao };
