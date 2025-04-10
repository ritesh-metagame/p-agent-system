import Container, { Service } from "typedi";
import UserDao from "../daos/user.dao";
import { RoleDao } from "../daos/role.dao";
import { Commission, Role, User } from "../../prisma/generated/prisma";
import { UserRole } from "../common/config/constants";
import { Response } from "../common/config/response";
import { ResponseCodes } from "../common/config/responseCodes";
import { BcryptService } from "../common/lib";
import { CommissionService } from "./commission.service";
import { CategoryService } from "./category.service";
import { SiteService } from "./site.service";
import { CategoryDao } from "../daos/category.dao";
import { toFloat } from "validator";

@Service()
class UserService {
  private userDao: UserDao;
  private roleDao: RoleDao;
  private commissionService: CommissionService;
  private categoryService: CategoryService;
  private siteService: SiteService;
  private categoryDao: CategoryDao;

  constructor() {
    this.userDao = new UserDao();
    this.roleDao = new RoleDao();
    this.commissionService = Container.get(CommissionService);
    this.categoryService = Container.get(CategoryService);
    this.siteService = Container.get(SiteService);
    this.categoryDao = new CategoryDao();
  }

  public async createUser(
    userData: Record<string, any>,
    roleId: string,
    user: User
  ) {
    try {
      // Add debug logs at each step of the createUser method
      console.debug("[createUser] Start creating user", {
        userData,
        roleId,
        user,
      });

      // Import prisma client
      const { prisma } = await import("../server");

      // Get current user role and determine new user role in one step
      const currentUserRole = await this.roleDao.getRoleById(roleId);

      // Log current user role
      console.debug("[createUser] Current user role", { currentUserRole });

      let role: Role;
      switch (currentUserRole.name) {
        case UserRole.SUPER_ADMIN:
          role = await this.roleDao.getRoleByName(UserRole.OPERATOR);
          break;
        case UserRole.OPERATOR:
          role = await this.roleDao.getRoleByName(UserRole.PLATINUM);
          break;
        case UserRole.PLATINUM:
          role = await this.roleDao.getRoleByName(UserRole.GOLDEN);
          break;
        default:
          throw new Error("Role not found");
      }

      // Log role determination
      console.debug("[createUser] Determined role for new user", { role });

      if (!role) {
        throw new Error("Role not found");
      }

      console.log({ userData });

      // Log settlement details validation
      if (currentUserRole.name === UserRole.SUPER_ADMIN) {
        if (
          !userData.eGamesCommissionComputationPeriod ||
          !userData.sportsBettingCommissionComputationPeriod ||
          !userData.specialityGamesCommissionComputationPeriod
        ) {
          throw new Error(
            "Commission computation period is required for SUPER_ADMIN role"
          );
        }
      } else {
        // Remove commission computation period for non-SUPER_ADMIN roles
        delete userData.eGamesCommissionComputationPeriod;
        delete userData.sportsBettingCommissionComputationPeriod;
        delete userData.specialityGamesCommissionComputationPeriod;
      }

      // Hash password and fetch categories in parallel
      console.debug("[createUser] Hashing password and fetching categories");
      const [hashedPassword, categories] = await Promise.all([
        BcryptService.generateHash(userData.password),
        this.categoryDao.getAllCategories(),
      ]);

      // Prepare user data
      const data: Partial<User> = {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bankName: userData.bankName,
        accountNumber: userData.accountNumber,
        password: hashedPassword,
        roleId: role.id,
        parentId: user.id,
      };

      // Execute all operations in a transaction to ensure atomicity
      console.debug("[createUser] Starting transaction for user creation");
      const result = await prisma.$transaction(
        async (tx) => {
          // Create user within transaction
          console.debug("[createUser] Creating new user", { data });
          const newUser = await tx.user.create({
            data: data as any,
          });
          console.debug("[createUser] New user created", { newUser });

          // Helper function to find category by name
          const findCategory = (name: string) =>
            categories.find((category) => category.name === name);

          // Process sites and commissions
          if (userData.siteIds && userData.siteIds.length > 0) {
            console.debug("[createUser] Processing sites and commissions", {
              siteIds: userData.siteIds,
            });
            for (const siteId of userData.siteIds) {
              // Create user-site relationship within transaction
              const userSite = await tx.userSite.create({
                data: {
                  userId: newUser.id,
                  siteId: siteId,
                },
              });

              console.debug("[createUser] User-site relationship created", {
                userSite,
              });

              // Create commissions for each category that has a value
              const commissionData = [];

              // Prepare commission data for eGames if provided
              if (userData.commissions.eGames) {
                console.debug(
                  "[createUser] Preparing commission data for eGames",
                  {
                    userData: userData.commissions.eGames,
                  }
                );
                const eGamesCategory = findCategory("eGames");
                if (eGamesCategory) {
                  commissionData.push({
                    userId: newUser.id,
                    roleId: role.id,
                    siteId: siteId,
                    categoryId: eGamesCategory.id,
                    commissionPercentage: toFloat(userData.commissions.eGames),
                    settlementPeriod: userData.settlementDetails?.period,
                    settlementStartingFrom: userData.settlementDetails
                      ? new Date(userData.settlementDetails.startDate)
                      : undefined,
                    settlementEndingAt: userData.settlementDetails
                      ? new Date(userData.settlementDetails.endDate)
                      : undefined,
                  });
                }
              }

              // Prepare commission data for sportsBetting if provided
              if (userData.commissions.sportsBetting) {
                console.debug(
                  "[createUser] Preparing commission data for sportsBetting",
                  {
                    userData: userData.commissions.sportsBetting,
                  }
                );
                const sportsBettingCategory = findCategory("Sports-Betting");
                if (sportsBettingCategory) {
                  commissionData.push({
                    userId: newUser.id,
                    roleId: role.id,
                    siteId: siteId,
                    categoryId: sportsBettingCategory.id,
                    commissionPercentage: toFloat(
                      userData.commissions.sportsBetting
                    ),
                    settlementPeriod: userData.settlementDetails?.period,
                    settlementStartingFrom: userData.settlementDetails
                      ? new Date(userData.settlementDetails.startDate)
                      : undefined,
                    settlementEndingAt: userData.settlementDetails
                      ? new Date(userData.settlementDetails.endDate)
                      : undefined,
                  });
                }
              }

              // Prepare commission data for specialtyGames if provided
              if (userData.commissions.specialtyGames) {
                console.debug(
                  "[createUser] Preparing commission data for specialtyGames",
                  {
                    userData: userData.commissions.specialtyGames,
                  }
                );
                const specialtyGamesCategory = findCategory("SpecialityGames");
                if (specialtyGamesCategory) {
                  commissionData.push({
                    userId: newUser.id,
                    roleId: role.id,
                    siteId: siteId,
                    categoryId: specialtyGamesCategory.id,
                    commissionPercentage: toFloat(
                      userData.commissions.specialtyGames
                    ),
                    settlementPeriod: userData.settlementDetails?.period,
                    settlementStartingFrom: userData.settlementDetails
                      ? new Date(userData.settlementDetails.startDate)
                      : undefined,
                    settlementEndingAt: userData.settlementDetails
                      ? new Date(userData.settlementDetails.endDate)
                      : undefined,
                  });
                }
              }

              console.debug(
                "[createUser] Commission data prepared for user-site relationship",
                { commissionData }
              );

              // Create all commissions in transaction
              for (const commission of commissionData) {
                await tx.commission.create({
                  data: commission,
                });
              }
            }
          }

          return newUser;
        },
        {
          // Set transaction isolation level to ensure consistency
          isolationLevel: "Serializable",
        }
      );

      console.debug("[createUser] Transaction completed successfully");
      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        ResponseCodes.USER_CREATED_SUCCESSFULLY.message,
        result
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return error;
    }
  }

  public async getUsersByParentId(partnerId: string) {
    try {
      const users = await this.userDao.getUsersByParentId(partnerId);

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.message,
        users
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching users: ${error.message}`,
        null
      );
    }
  }

  public async getAllUsers(startDate?: string, endDate?: string) {
    try {
      const users = await this.userDao.getAllUsersWithDetails(
        startDate,
        endDate
      );

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.message,
        users
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching all users: ${error.message}`,
        null
      );
    }
  }

  public async getTransactionByCategory(categoryName?: string) {
    try {
      const users = await this.userDao.getTransactionsByCategoryName();

      return new Response(
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.message,
        users
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching all users: ${error.message}`,
        null
      );
    }
  }

  public async getTransactionByCategoryAndAgent(
    categoryName?: string,
    agent?: "gold" | "platinum" | "operator"
  ) {
    try {
      const users = await this.userDao.getCategoryTransaction(
        categoryName,
        agent
      );

      return new Response(
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.TRANSACTION_FETCHED_SUCCESSFULLY.message,
        users
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching all users: ${error.message}`,
        null
      );
    }
  }
}

export { UserService };
