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
import { prisma } from "../server";

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

  public async getUserDetails(userId: string) {
    try {
      const userDetails =
        await this.userDao.getUserDetailsWithCommissions(userId);

      if (!userDetails) {
        return new Response(
          ResponseCodes.USERS_FETCHED_FAILED.code,
          "User not found",
          null
        );
      }

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.message,
        userDetails
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching user details: ${error.message}`,
        null
      );
    }
  }

  public async updateUser(
    userId: string,
    userData: Record<string, any>,
    currentUser: User
  ) {
    try {
      // Fetch existing user to check role hierarchy and get current data
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          commissions: true,
          userSites: true,
        },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Get current user's role to check permissions
      const currentUserRole = await this.roleDao.getRoleById(
        currentUser.roleId
      );
      if (!currentUserRole) {
        throw new Error("Current user role not found");
      }

      // Basic user data update
      const userUpdateData: any = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        bankName: userData.bankName,
        accountNumber: userData.accountNumber,
        approved: userData.approved,
        updatedBy: currentUser.id,
      };

      // If password is provided, hash it
      if (userData.password) {
        userUpdateData.password = await BcryptService.generateHash(
          userData.password
        );
      }

      // Start a transaction for atomic updates
      const result = await prisma.$transaction(async (tx) => {
        // Update basic user information
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });

        // Update sites if provided
        if (userData.siteIds) {
          // Delete existing user-site relationships
          await tx.userSite.deleteMany({
            where: { userId: userId },
          });

          // Create new user-site relationships
          for (const siteId of userData.siteIds) {
            await tx.userSite.create({
              data: {
                userId: userId,
                siteId: siteId,
              },
            });
          }
        }

        // Update commissions if provided
        if (userData.commissions) {
          // Handle commission updates
          const categories = await this.categoryDao.getAllCategories();
          const findCategory = (name: string) =>
            categories.find((category) => category.name === name);

          // Process each site's commissions
          for (const siteId of userData.siteIds || []) {
            // Update eGames commission
            if (userData.commissions.eGames !== undefined) {
              const eGamesCategory = findCategory("eGames");
              if (eGamesCategory) {
                await this.updateCommission(tx, {
                  userId,
                  siteId,
                  categoryId: eGamesCategory.id,
                  commissionPercentage: toFloat(userData.commissions.eGames),
                  settlementPeriod: userData.settlementDetails?.period,
                  updatedBy: currentUser.id,
                });
              }
            }

            // Update sportsBetting commission
            if (userData.commissions.sportsBetting !== undefined) {
              const sportsBettingCategory = findCategory("Sports-Betting");
              if (sportsBettingCategory) {
                await this.updateCommission(tx, {
                  userId,
                  siteId,
                  categoryId: sportsBettingCategory.id,
                  commissionPercentage: toFloat(
                    userData.commissions.sportsBetting
                  ),
                  settlementPeriod: userData.settlementDetails?.period,
                  updatedBy: currentUser.id,
                });
              }
            }

            // Update specialtyGames commission
            if (userData.commissions.specialtyGames !== undefined) {
              const specialtyGamesCategory = findCategory("SpecialityGames");
              if (specialtyGamesCategory) {
                await this.updateCommission(tx, {
                  userId,
                  siteId,
                  categoryId: specialtyGamesCategory.id,
                  commissionPercentage: toFloat(
                    userData.commissions.specialtyGames
                  ),
                  settlementPeriod: userData.settlementDetails?.period,
                  updatedBy: currentUser.id,
                });
              }
            }
          }
        }

        return updatedUser;
      });

      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        "User updated successfully",
        result
      );
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error updating user: ${error.message}`,
        null
      );
    }
  }

  private async updateCommission(
    tx: any,
    data: {
      userId: string;
      siteId: string;
      categoryId: string;
      commissionPercentage: number;
      settlementPeriod?: string;
      updatedBy: string;
    }
  ) {
    // Try to find existing commission
    const existingCommission = await tx.commission.findFirst({
      where: {
        userId: data.userId,
        siteId: data.siteId,
        categoryId: data.categoryId,
      },
    });

    if (existingCommission) {
      // Update existing commission
      return await tx.commission.update({
        where: { id: existingCommission.id },
        data: {
          commissionPercentage: data.commissionPercentage,
          ...(data.settlementPeriod && {
            commissionComputationPeriod: data.settlementPeriod,
          }),
          updatedBy: data.updatedBy,
        },
      });
    } else {
      // Create new commission
      return await tx.commission.create({
        data: {
          userId: data.userId,
          siteId: data.siteId,
          categoryId: data.categoryId,
          commissionPercentage: data.commissionPercentage,
          commissionComputationPeriod: data.settlementPeriod || "MONTHLY",
          updatedBy: data.updatedBy,
          createdBy: data.updatedBy,
        },
      });
    }
  }

  public async updateProfile(
    userId: string,
    profileData: Record<string, any>,
    currentUser: User
  ) {
    try {
      // Verify the user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Verify current user can only update their own profile
      if (userId !== currentUser.id) {
        throw new Error("You can only update your own profile");
      }

      // Prepare update data
      const updateData: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
        bankName: profileData.bankName,
        accountNumber: profileData.accountNumber,
        updatedBy: currentUser.id,
      };

      // If password is provided, hash it
      if (profileData.password) {
        updateData.password = await BcryptService.generateHash(
          profileData.password
        );
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          role: true,
        },
      });

      // Remove sensitive information
      const { password, ...userWithoutPassword } = updatedUser;

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        "Profile updated successfully",
        userWithoutPassword
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error updating profile: ${error.message}`,
        null
      );
    }
  }

  public async getUserDetailsByUsername(username: string) {
    try {
      const userDetails =
        await this.userDao.getUserDetailsWithCommissionsByUsername(username);

      if (!userDetails) {
        return new Response(
          ResponseCodes.USERS_FETCHED_FAILED.code,
          "User not found",
          null
        );
      }

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.message,
        userDetails
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error fetching user details: ${error.message}`,
        null
      );
    }
  }

  public async updateUserByUsername(
    username: string,
    userData: Record<string, any>,
    currentUser: User
  ) {
    console.log({ username, userData, currentUser });

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username },
        include: {
          role: true,
          commissions: true,
          userSites: {
            include: {
              site: true,
            },
          },
        },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Get current user's role to check permissions
      const currentUserRole = await this.roleDao.getRoleById(
        currentUser.roleId
      );
      if (!currentUserRole) {
        throw new Error("Current user role not found");
      }

      // Basic user data update - use existing values if not provided
      const userUpdateData: any = {
        updatedBy: currentUser.id,
        username:
          userData.username !== undefined
            ? userData.username
            : existingUser.username,
        firstName:
          userData.firstName !== undefined
            ? userData.firstName
            : existingUser.firstName,
        lastName:
          userData.lastName !== undefined
            ? userData.lastName
            : existingUser.lastName,
        bankName:
          userData.bankName !== undefined
            ? userData.bankName
            : existingUser.bankName,
        accountNumber:
          userData.accountNumber !== undefined
            ? userData.accountNumber
            : existingUser.accountNumber,
        approved:
          userData.approved !== undefined
            ? userData.approved
            : existingUser.approved,
      };

      // If password is provided, hash it
      if (userData.password) {
        userUpdateData.password = await BcryptService.generateHash(
          userData.password
        );
      }

      // Start a transaction for atomic updates
      const result = await prisma.$transaction(async (tx) => {
        // Update basic user information
        const updatedUser = await tx.user.update({
          where: { username },
          data: userUpdateData,
        });

        // Handle sites - if not provided, keep existing sites
        const siteIds =
          userData.siteIds && Array.isArray(userData.siteIds)
            ? userData.siteIds
            : existingUser.userSites.map((us) => us.site.id);

        // Update site relationships
        if (siteIds.length > 0) {
          // Delete existing user-site relationships
          await tx.userSite.deleteMany({
            where: { userId: existingUser.id },
          });

          // Create new user-site relationships
          for (const siteId of siteIds) {
            await tx.userSite.create({
              data: {
                userId: existingUser.id,
                siteId: siteId,
              },
            });
          }
        }

        // Handle commissions - if not provided, keep existing commissions
        if (userData.commissions) {
          const categories = await this.categoryDao.getAllCategories();
          const findCategory = (name: string) =>
            categories.find((category) => category.name === name);

          // Get existing commissions mapped by category name for easy lookup
          const existingCommissions = existingUser.commissions.reduce(
            (acc, comm) => {
              const category = categories.find((c) => c.id === comm.categoryId);
              if (category) {
                acc[category.name] = comm;
              }
              return acc;
            },
            {}
          );

          // Process each site's commissions
          for (const siteId of siteIds) {
            // Handle eGames commission
            const eGamesCategory = findCategory("eGames");
            if (eGamesCategory) {
              const existingEGamesComm = existingCommissions["eGames"];
              if (
                userData.commissions.eGames !== undefined ||
                existingEGamesComm
              ) {
                await this.updateCommission(tx, {
                  userId: existingUser.id,
                  siteId,
                  categoryId: eGamesCategory.id,
                  commissionPercentage:
                    userData.commissions.eGames !== undefined
                      ? toFloat(userData.commissions.eGames)
                      : existingEGamesComm?.commissionPercentage || 0,
                  settlementPeriod:
                    userData.settlementDetails?.period ||
                    existingEGamesComm?.commissionComputationPeriod,
                  updatedBy: currentUser.id,
                });
              }
            }

            // Handle sportsBetting commission
            const sportsBettingCategory = findCategory("Sports-Betting");
            if (sportsBettingCategory) {
              const existingSportsBettingComm =
                existingCommissions["Sports-Betting"];
              if (
                userData.commissions.sportsBetting !== undefined ||
                existingSportsBettingComm
              ) {
                await this.updateCommission(tx, {
                  userId: existingUser.id,
                  siteId,
                  categoryId: sportsBettingCategory.id,
                  commissionPercentage:
                    userData.commissions.sportsBetting !== undefined
                      ? toFloat(userData.commissions.sportsBetting)
                      : existingSportsBettingComm?.commissionPercentage || 0,
                  settlementPeriod:
                    userData.settlementDetails?.period ||
                    existingSportsBettingComm?.commissionComputationPeriod,
                  updatedBy: currentUser.id,
                });
              }
            }

            // Handle specialtyGames commission
            const specialtyGamesCategory = findCategory("SpecialityGames");
            if (specialtyGamesCategory) {
              const existingSpecialtyGamesComm =
                existingCommissions["SpecialityGames"];
              if (
                userData.commissions.specialtyGames !== undefined ||
                existingSpecialtyGamesComm
              ) {
                await this.updateCommission(tx, {
                  userId: existingUser.id,
                  siteId,
                  categoryId: specialtyGamesCategory.id,
                  commissionPercentage:
                    userData.commissions.specialtyGames !== undefined
                      ? toFloat(userData.commissions.specialtyGames)
                      : existingSpecialtyGamesComm?.commissionPercentage || 0,
                  settlementPeriod:
                    userData.settlementDetails?.period ||
                    existingSpecialtyGamesComm?.commissionComputationPeriod,
                  updatedBy: currentUser.id,
                });
              }
            }
          }
        }

        return updatedUser;
      });

      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        "User updated successfully",
        result
      );
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response(
        ResponseCodes.USERS_FETCHED_FAILED.code,
        `Error updating user: ${error.message}`,
        null
      );
    }
  }
}

export { UserService };
