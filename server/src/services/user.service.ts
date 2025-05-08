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
import * as ExcelJS from "exceljs";
import { Response as expressResponse } from "express";
import { NetworkStatisticsDao } from "../daos/network-statistics.dao";

@Service()
class UserService {
  private userDao: UserDao;
  private roleDao: RoleDao;
  private commissionService: CommissionService;
  private categoryService: CategoryService;
  private siteService: SiteService;
  private categoryDao: CategoryDao;
  private networkStatisticsDao: NetworkStatisticsDao;

  constructor() {
    this.userDao = new UserDao();
    this.roleDao = new RoleDao();
    this.commissionService = Container.get(CommissionService);
    this.categoryService = Container.get(CategoryService);
    this.siteService = Container.get(SiteService);
    this.categoryDao = new CategoryDao();
    this.networkStatisticsDao = new NetworkStatisticsDao();
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

      // Log settlement details validation
      if (currentUserRole.name === UserRole.SUPER_ADMIN) {
        if (
          !userData.eGamesCommissionComputationPeriod ||
          !userData.sportsBettingCommissionComputationPeriod ||
          !userData.specialityGamesRngCommissionComputationPeriod ||
          !userData.specialityGamesToteCommissionComputationPeriod
        ) {
          throw new Error(
            "Commission computation period is required for SUPER_ADMIN role"
          );
        }
      } else {
        // Remove commission computation period for non-SUPER_ADMIN roles
        delete userData.eGamesCommissionComputationPeriod;
        delete userData.sportsBettingCommissionComputationPeriod;
        delete userData.specialityGamesRngCommissionComputationPeriod;
        delete userData.specialityGamesRngCommissionComputationPeriod;
      }

      // Hash password and fetch categories in parallel
      console.debug("[createUser] Hashing password and fetching categories");
      const [hashedPassword, categories] = await Promise.all([
        BcryptService.generateHash(userData.password),
        this.categoryDao.getAllCategories(),
      ]);

      const GOLDEN_AFFILIATE_LINK = `${process.env.AFFILIATE_LINK_GOLDEN}`;
      const AFFILIATE_LINK = `${process.env.AFFILIATE_LINK}?parentCode=${userData.username}`;

      // Prepare user data
      const data: Partial<User> = {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bankName: userData.bankName,
        accountNumber: userData.accountNumber,
        mobileNumber: userData.mobileNumber,
        affiliateLink: role.name === UserRole.GOLDEN
    ? process.env.AFFILIATE_LINK_GOLDEN
    : AFFILIATE_LINK,
        password: hashedPassword,
        roleId: role.id,
        parentId: user.id,
        approved: 0
      };

      // Put another check if user with username already exists return error message
      const existingUser = await this.userDao.getUserByUsername(
        userData.username
      );

      if (existingUser) {
        return new Response(
          ResponseCodes.USER_ALREADY_EXISTS.code,
          ResponseCodes.USER_ALREADY_EXISTS.message,
          null
        );
      }

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
                const eGamesCategory = findCategory("E-Games");
                if (eGamesCategory) {
                  // Determine which field to populate based on role hierarchy
                  const isGolden = role.name === UserRole.GOLDEN;
                  
                  commissionData.push({
                    userId: newUser.id,
                    roleId: role.id,
                    siteId: siteId,
                    categoryId: eGamesCategory.id,
                    commissionPercentage: isGolden ? toFloat(userData.commissions.eGames) : 0,
                    totalAssignedCommissionPercentage: !isGolden ? toFloat(userData.commissions.eGames) : 0,
                    settlementPeriod: "BI_MONTHLY",
                    settlementStartingFrom: userData.settlementDetails
                      ? new Date(userData.settlementDetails.startDate)
                      : undefined,
                    settlementEndingAt: userData.settlementDetails
                      ? new Date(userData.settlementDetails.endDate)
                      : undefined,
                  });
                  
                  // Update parent's commission if "Own" values are provided
                  if (userData.commissions.eGamesOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                    // Find parent's commission for this category and site
                    const parentCommission = await tx.commission.findFirst({
                      where: {
                        userId: user.id,
                        categoryId: eGamesCategory.id,
                        siteId: siteId
                      }
                    });
                    
                    if (parentCommission) {
                      await tx.commission.update({
                        where: { id: parentCommission.id },
                        data: {
                          commissionPercentage: toFloat(userData.commissions.eGamesOwn)
                        }
                      });
                    }
                  }
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
                const sportsBettingCategory = findCategory("Sports Betting");
                if (sportsBettingCategory) {
                  // Determine which field to populate based on role hierarchy
                  const isGolden = role.name === UserRole.GOLDEN;
                  
                  commissionData.push({
                    userId: newUser.id,
                    roleId: role.id,
                    siteId: siteId,
                    categoryId: sportsBettingCategory.id,
                    commissionPercentage: isGolden ? toFloat(userData.commissions.sportsBetting) : 0,
                    totalAssignedCommissionPercentage: !isGolden ? toFloat(userData.commissions.sportsBetting) : 0,
                    settlementPeriod: "WEEKLY",
                    settlementStartingFrom: userData.settlementDetails
                      ? new Date(userData.settlementDetails.startDate)
                      : undefined,
                    settlementEndingAt: userData.settlementDetails
                      ? new Date(userData.settlementDetails.endDate)
                      : undefined,
                  });
                  
                  // Update parent's commission if "Own" values are provided
                  if (userData.commissions.sportsBettingOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                    // Find parent's commission for this category and site
                    const parentCommission = await tx.commission.findFirst({
                      where: {
                        userId: user.id,
                        categoryId: sportsBettingCategory.id,
                        siteId: siteId
                      }
                    });
                    
                    if (parentCommission) {
                      await tx.commission.update({
                        where: { id: parentCommission.id },
                        data: {
                          commissionPercentage: toFloat(userData.commissions.sportsBettingOwn)
                        }
                      });
                    }
                  }
                }
              }

              if (userData.commissions.specialityGamesTote) {
                console.debug(
                  "[createUser] Preparing commission data for specialtyGames",
                  {
                    userData: userData.commissions.specialityGamesTote,
                  }
                );
                const specialtyGamesToteCategory = findCategory(
                  "Speciality Games - Tote"
                );
                if (specialtyGamesToteCategory) {
                  // Determine which field to populate based on role hierarchy
                  const isGolden = role.name === UserRole.GOLDEN;
                  
                  commissionData.push({
                    userId: newUser.id,
                    roleId: role.id,
                    siteId: siteId,
                    categoryId: specialtyGamesToteCategory.id,
                    commissionPercentage: isGolden ? toFloat(userData.commissions.specialityGamesTote) : 0,
                    totalAssignedCommissionPercentage: !isGolden ? toFloat(userData.commissions.specialityGamesTote) : 0,
                    settlementPeriod: "WEEKLY",
                    settlementStartingFrom: userData.settlementDetails
                      ? new Date(userData.settlementDetails.startDate)
                      : undefined,
                    settlementEndingAt: userData.settlementDetails
                      ? new Date(userData.settlementDetails.endDate)
                      : undefined,
                  });
                  
                  // Update parent's commission if "Own" values are provided
                  if (userData.commissions.specialtyGamesToteOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                    // Find parent's commission for this category and site
                    const parentCommission = await tx.commission.findFirst({
                      where: {
                        userId: user.id,
                        categoryId: specialtyGamesToteCategory.id,
                        siteId: siteId
                      }
                    });
                    
                    if (parentCommission) {
                      await tx.commission.update({
                        where: { id: parentCommission.id },
                        data: {
                          commissionPercentage: toFloat(userData.commissions.specialtyGamesToteOwn)
                        }
                      });
                    }
                  }
                }
              }

              // Prepare commission data for specialtyGames if provided
              if (userData.commissions.specialityGamesRng) {
                console.debug(
                  "[createUser] Preparing commission data for specialtyGames",
                  {
                    userData: userData.commissions.specialityGames,
                  }
                );
                const specialtyGamesRngCategory = findCategory(
                  "Speciality Games - RNG"
                );
                if (specialtyGamesRngCategory) {
                  // Determine which field to populate based on role hierarchy
                  const isGolden = role.name === UserRole.GOLDEN;
                  
                  commissionData.push({
                    userId: newUser.id,
                    roleId: role.id,
                    siteId: siteId,
                    categoryId: specialtyGamesRngCategory.id,
                    commissionPercentage: isGolden ? toFloat(userData.commissions.specialityGamesRng) : 0,
                    totalAssignedCommissionPercentage: !isGolden ? toFloat(userData.commissions.specialityGamesRng) : 0,
                    settlementPeriod: "BI_MONTHLY",
                    settlementStartingFrom: userData.settlementDetails
                      ? new Date(userData.settlementDetails.startDate)
                      : undefined,
                    settlementEndingAt: userData.settlementDetails
                      ? new Date(userData.settlementDetails.endDate)
                      : undefined,
                  });
                  
                  // Update parent's commission if "Own" values are provided
                  if (userData.commissions.specialtyGamesRngOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                    // Find parent's commission for this category and site
                    const parentCommission = await tx.commission.findFirst({
                      where: {
                        userId: user.id,
                        categoryId: specialtyGamesRngCategory.id,
                        siteId: siteId
                      }
                    });
                    
                    if (parentCommission) {
                      await tx.commission.update({
                        where: { id: parentCommission.id },
                        data: {
                          commissionPercentage: toFloat(userData.commissions.specialtyGamesRngOwn)
                        }
                      });
                    }
                  }
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

      // Update the parent user's network statistics
      try {
        console.debug("[createUser] Updating parent user's network statistics");
        await this.networkStatisticsDao.calculateAndUpdateNetworkStatistics();
        console.debug("[createUser] Network statistics updated successfully");
      } catch (statsError) {
        console.error("Error updating network statistics:", statsError);
        // We don't want to fail the user creation if stats update fails
        // Just log the error and continue
      }

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

  public async registerPartner(
    registerData: Record<string, any>,
  ) {
    try {
      const parentCode = registerData.parentCode;

      const parentUser = await this.userDao.getUserByUsername(parentCode);

      
      const user = await this.userDao.getUserByUsername(registerData.username);

      if (user) {
        return new Response(
          ResponseCodes.USER_ALREADY_EXISTS.code,
          ResponseCodes.USER_ALREADY_EXISTS.message,
          null
        );
      }

      if (!parentCode || !parentUser) {
        return new Response(
          ResponseCodes.PARTNER_NOT_FOUND.code,
          ResponseCodes.PARTNER_NOT_FOUND.message,
          null
        );
      }

      let role: Role;
      switch (parentUser.role.name) {
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

      const hashedPassword = await BcryptService.generateHash(registerData.password)

        const registrationData: Partial<User> = {
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          username: registerData.username,
          password: hashedPassword,
          mobileNumber: registerData.mobileNumber,
          roleId: role.id,
          approved: 0,
          parentId: parentUser.id
      };

      const newUser = await prisma.user.create({
        data: registrationData as any,
      })

      return new Response(
        ResponseCodes.USER_CREATED_SUCCESSFULLY.code,
        ResponseCodes.USER_CREATED_SUCCESSFULLY.message,
        newUser
      )


    } catch (error) {
      console.log("Error registering partner:", error);
      return error;
    }
  }

  public async approvePartner(data: Record<string, any>) {
    try {
      const user = await this.userDao.getUserByUserId(data.userId);

      if (!user) {
        return new Response(
          ResponseCodes.PARTNER_NOT_FOUND.code,
          ResponseCodes.PARTNER_NOT_FOUND.message,
          null
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: data.userId },
        data: {
          approved: data.status,
        },
      });

      return new Response(
        ResponseCodes.USER_APPROVAL_UPDATED_SUCCESSFULLY.code,
        ResponseCodes.USER_APPROVAL_UPDATED_SUCCESSFULLY.message,
        updatedUser
      );
    } catch (error) {
      return error;
    }
  }
  
  public async getPartnersForApproval(user: User) {
    try {
      
      const pendingPartners = await prisma.user.findMany({
        where: {
          parentId: user.id
        },
        include: {
          children: {
            where: {
              approved: 0
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              mobileNumber: true,
              approved: true
            }
          }
        }
      })

      return new Response(
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_FETCHED_SUCCESSFULLY.message,
        pendingPartners
      );

    } catch (error) {
      return error
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

  public async getUserPayoutAndWalletBalance(partnerId: string) {
    try {
      const users = await this.userDao.getUserPayoutAndWalletBalance(partnerId);

      return new Response(
        ResponseCodes.USERS_PAYOUT_AND_WALLET_BALANCE_FETCHED_SUCCESSFULLY.code,
        ResponseCodes.USERS_PAYOUT_AND_WALLET_BALANCE_FETCHED_SUCCESSFULLY.message,
        users
      );
    } catch (error) {
      return new Response(
        ResponseCodes.USERS_PAYOUT_AND_WALLET_BALANCE_FETCHED_FAILED.code,
        ResponseCodes.USERS_PAYOUT_AND_WALLET_BALANCE_FETCHED_FAILED.message
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

  public async getDownloadReportLists(
    user: any,
    downlineId: string,
    fromDateISO: any,
    toDateISO: any,
    res: expressResponse
  ) {
    try {
      const users =
        await this.commissionService.getCommissionPayoutReport(downlineId);
      const breakdown =
        await this.commissionService.getCommissionBreakdownForDownLoadReport(
          user.id,
          user.role.name,
          fromDateISO,
          toDateISO,
          downlineId
        );

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Commission Report");

      // Utility function for header styling
      const applyHeaderStyle = (row: ExcelJS.Row) => {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "002060" }, // Dark blue
          };
          cell.font = {
            color: { argb: "FFFFFF" }, // White
            bold: true,
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      };

      // === 1. HEADER for Breakdown per Game Type ===
      const row1 = sheet.addRow(["PERIOD", "START DATE", "END DATE"]);
      applyHeaderStyle(row1);

      sheet.addRow([]);
      const gameTypeHeader = sheet.addRow(["BREAKDOWN PER GAME TYPE"]);
      applyHeaderStyle(gameTypeHeader);

      sheet.addRow([]);

      // E-GAMES breakdown
      const egamesTitleRow = sheet.addRow(["E-GAMES"]);
      applyHeaderStyle(egamesTitleRow);

      const egamesHeaderRow = sheet.addRow(["", "Amount", "Settled All"]);
      applyHeaderStyle(egamesHeaderRow);

      const egames = users?.data?.categories?.["E-GAMES"] || [];
      egames.forEach((item) => {
        sheet.addRow([item.label, item.allTime]);
      });

      sheet.addRow([]);

      // SPORTS BETTING breakdown
      const sportsTitleRow = sheet.addRow(["SPORTS BETTING"]);
      applyHeaderStyle(sportsTitleRow);

      const sportsHeaderRow = sheet.addRow(["", "Amount", "Settled All"]);
      applyHeaderStyle(sportsHeaderRow);

      const sports = users?.data?.categories?.["SPORTS BETTING"] || [];
      sports.forEach((item) => {
        sheet.addRow([item.label, item.allTime]);
      });

      sheet.addRow([]);
      sheet.addRow([]);

      // === 2. BREAKDOWN PER section ===
      const breakdownPerRow = sheet.addRow(["BREAKDOWN PER"]);
      applyHeaderStyle(breakdownPerRow);

      const columnHeaders = sheet.addRow([
        "NETWORK",
        "NAME",
        "TOTAL EGAMES GROSS COMMISSIONS",
        "TOTAL SPORTS GROSS COMMISSIONS",
        "LESS: PAYMENT GATEWAY FEES",
        "TOTAL NET COMMISSIONS",
      ]);
      applyHeaderStyle(columnHeaders);

      const sections = ["operator", "platinum", "gold"];
      const userData = breakdown?.data?.data || {};

      for (const section of sections) {
        if (userData[section]?.length) {
          userData[section].forEach((entry: any) => {
            sheet.addRow([
              entry.network,
              entry.name,
              entry.egamesCommission || 0,
              entry.sportsCommission || 0,
              entry.paymentGatewayFee || 0,
              entry.finalNetCommission || 0,
            ]);
          });

          if (section === "platinum") {
            const totalRow = sheet.addRow(["PLATINUM PARTNER TOTAL"]);
            totalRow.getCell(1).font = { bold: true };
          }

          if (section === "gold") {
            const totalRow = sheet.addRow(["GOLDEN PARTNER TOTAL"]);
            totalRow.getCell(1).font = { bold: true };
          }
        }
      }

      // === 3. Send as downloadable Excel file ===
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=commission-report-${downlineId}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating report");
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
    agent?: UserRole
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
            // Handle eGames commission
            if (userData.commissions.eGames !== undefined || userData.commissions.eGamesOwn !== undefined) {
              const eGamesCategory = findCategory("E-Games");
              if (eGamesCategory) {
                // Update regular commission
                if (userData.commissions.eGames !== undefined) {
                  await this.updateCommission(tx, {
                    userId,
                    siteId,
                    categoryId: eGamesCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.eGames),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: false
                  });
                }
                
                // Update own commission if provided
                if (userData.commissions.eGamesOwn !== undefined) {
                  await this.updateCommission(tx, {
                    userId: currentUser.id, // Update current user's commission
                    siteId,
                    categoryId: eGamesCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.eGamesOwn),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: true
                  });
                }
              }
            }

            // Handle sportsBetting commission
            if (userData.commissions.sportsBetting !== undefined || userData.commissions.sportsBettingOwn !== undefined) {
              const sportsBettingCategory = findCategory("Sports Betting");
              if (sportsBettingCategory) {
                // Update regular commission
                if (userData.commissions.sportsBetting !== undefined) {
                  await this.updateCommission(tx, {
                    userId,
                    siteId,
                    categoryId: sportsBettingCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.sportsBetting),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: false
                  });
                }
                
                // Update own commission if provided
                if (userData.commissions.sportsBettingOwn !== undefined) {
                  await this.updateCommission(tx, {
                    userId: currentUser.id,
                    siteId,
                    categoryId: sportsBettingCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.sportsBettingOwn),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: true
                  });
                }
              }
            }

            // Handle specialityGamesRng commission
            if (userData.commissions.specialityGamesRng !== undefined || userData.commissions.specialityGamesRngOwn !== undefined) {
              const specialityGamesRngCategory = findCategory("Speciality Games - RNG");
              if (specialityGamesRngCategory) {
                // Update regular commission
                if (userData.commissions.specialityGamesRng !== undefined) {
                  await this.updateCommission(tx, {
                    userId,
                    siteId,
                    categoryId: specialityGamesRngCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.specialityGamesRng),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: false
                  });
                }
                
                // Update own commission if provided
                if (userData.commissions.specialityGamesRngOwn !== undefined) {
                  await this.updateCommission(tx, {
                    userId: currentUser.id,
                    siteId,
                    categoryId: specialityGamesRngCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.specialityGamesRngOwn),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: true
                  });
                }
              }
            }

            // Handle specialityGamesTote commission
            if (userData.commissions.specialityGamesTote !== undefined || userData.commissions.specialityGamesToteOwn !== undefined) {
              const specialityGamesToteCategory = findCategory("Speciality Games - Tote");
              if (specialityGamesToteCategory) {
                // Update regular commission
                if (userData.commissions.specialityGamesTote !== undefined) {
                  await this.updateCommission(tx, {
                    userId,
                    siteId,
                    categoryId: specialityGamesToteCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.specialityGamesTote),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: false
                  });
                }
                
                // Update own commission if provided
                if (userData.commissions.specialityGamesToteOwn !== undefined) {
                  await this.updateCommission(tx, {
                    userId: currentUser.id,
                    siteId,
                    categoryId: specialityGamesToteCategory.id,
                    totalAssignedCommissionPercentage: toFloat(userData.commissions.specialityGamesToteOwn),
                    settlementPeriod: userData.settlementDetails?.period,
                    updatedBy: currentUser.id,
                    isOwnCommission: true
                  });
                }
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
      commissionPercentage?: number;
      totalAssignedCommissionPercentage: number;
      settlementPeriod?: string;
      updatedBy: string;
      isOwnCommission?: boolean;
    }
  ) {
    // Get user role to determine commission handling
    const userRole = await tx.user.findUnique({
      where: { id: data.userId },
      include: { role: true }
    });

    // If it's an own commission update, always set commissionPercentage
    // Otherwise follow the role-based logic
    const isGolden = userRole?.role?.name === UserRole.GOLDEN;
    const useCommissionPercentage = data.isOwnCommission || isGolden;

    // Try to find existing commission
    const existingCommission = await tx.commission.findFirst({
      where: {
        user: { id: data.userId },
        site: { id: data.siteId },
        category: { id: data.categoryId },
      },
    });

    if (existingCommission) {
      // Update existing commission
      return await tx.commission.update({
        where: { id: existingCommission.id },
        data: {
          commissionPercentage: useCommissionPercentage ? data.totalAssignedCommissionPercentage : 0,
          totalAssignedCommissionPercentage: !useCommissionPercentage ? data.totalAssignedCommissionPercentage : 0,
          ...(data.settlementPeriod && {
            commissionComputationPeriod: data.settlementPeriod,
          }),
          updatedBy: data.updatedBy,
          site: {
            connect: { id: data.siteId },
          },
          user: {
            connect: { id: data.userId },
          },
          category: {
            connect: { id: data.categoryId },
          },
        },
      });
    } else {
      // Create new commission
      return await tx.commission.create({
        data: {
          commissionPercentage: useCommissionPercentage ? data.totalAssignedCommissionPercentage : 0,
          totalAssignedCommissionPercentage: !useCommissionPercentage ? data.totalAssignedCommissionPercentage : 0,
          commissionComputationPeriod: data.settlementPeriod || "MONTHLY",
          updatedBy: data.updatedBy,
          createdBy: data.updatedBy,
          site: {
            connect: { id: data.siteId },
          },
          user: {
            connect: { id: data.userId },
          },
          category: {
            connect: { id: data.categoryId },
          },
          role: {
            connect: { id: userRole.roleId },
          },
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
    console.log({ userData });

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

      const parentUser = await prisma.user.findUnique({
        where: { id: existingUser?.parentId },
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
        mobileNumber:
          userData.mobileNumber !== undefined
            ? userData.mobileNumber
            : existingUser.mobileNumber,
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
            const eGamesCategory = findCategory("E-Games");
            if (eGamesCategory) {
              const existingEGamesComm = existingCommissions["E-Games"];
              if (
                userData.commissions.eGames !== undefined ||
                existingEGamesComm
              ) {
                await this.updateCommission(tx, {
                  userId: existingUser.id,
                  siteId,
                  categoryId: eGamesCategory.id,
                  totalAssignedCommissionPercentage: userData.commissions.eGames !== undefined
                  ? toFloat(userData.commissions.eGames)
                  : existingEGamesComm?.commissionPercentage || 0, 
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

              // Update parent's commission if "Own" values are provided
              if (userData.commissions.eGamesOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                // Find parent's commission for this category and site
                const parentCommission = await tx.commission.findFirst({
                  where: {
                    userId: parentUser.id,
                    categoryId: eGamesCategory.id,
                    siteId: siteId
                  }
                });
                
                if (parentCommission) {
                  await tx.commission.update({
                    where: { id: parentCommission.id },
                    data: {
                      commissionPercentage: toFloat(userData.commissions.eGamesOwn)
                    }
                  });
                }
              }
            }

            // Handle sportsBetting commission
            const sportsBettingCategory = findCategory("Sports Betting");
            if (sportsBettingCategory) {
              const existingSportsBettingComm =
                existingCommissions["Sports Betting"];
              if (
                userData.commissions.sportsBetting !== undefined ||
                existingSportsBettingComm
              ) {
                await this.updateCommission(tx, {
                  userId: existingUser.id,
                  siteId,
                  categoryId: sportsBettingCategory.id,
                  totalAssignedCommissionPercentage:
                    userData.commissions.sportsBetting !== undefined
                      ? toFloat(userData.commissions.sportsBetting)
                      : existingSportsBettingComm?.commissionPercentage || 0,
                  settlementPeriod:
                    userData.settlementDetails?.period ||
                    existingSportsBettingComm?.commissionComputationPeriod,
                  updatedBy: currentUser.id,
                });
              }

              // Update parent's commission if "Own" values are provided
              if (userData.commissions.sportsBettingOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                // Find parent's commission for this category and site
                const parentCommission = await tx.commission.findFirst({
                  where: {
                    userId: parentUser.id,
                    categoryId: sportsBettingCategory.id,
                    siteId: siteId
                  }
                });
                
                if (parentCommission) {
                  await tx.commission.update({
                    where: { id: parentCommission.id },
                    data: {
                      commissionPercentage: toFloat(userData.commissions.sportsBettingOwn)
                    }
                  });
                }
              }
            }

            // Handle specialtyGames commission
            const specialtyGamesRngCategory = findCategory(
              "Speciality Games - RNG"
            );

            console.log({ specialtyGamesRngCategory });

            // console.log({ specialtyGamesCategory });
            if (specialtyGamesRngCategory) {
              const existingSpecialityGamesComm =
                existingCommissions["Speciality Games - RNG"];
              if (
                userData.commissions.specialityGamesRng !== undefined ||
                existingSpecialityGamesComm
              ) {
                await this.updateCommission(tx, {
                  userId: existingUser.id,
                  siteId,
                  categoryId: specialtyGamesRngCategory.id,
                  totalAssignedCommissionPercentage:
                    userData.commissions.specialityGamesRng !== undefined
                      ? toFloat(userData.commissions.specialityGamesRng)
                      : existingSpecialityGamesComm?.commissionPercentage || 0,
                  settlementPeriod:
                    userData.settlementDetails?.period ||
                    existingSpecialityGamesComm?.commissionComputationPeriod,
                  updatedBy: currentUser.id,
                });
              }

              // Update parent's commission if "Own" values are provided
              if (userData.commissions.specialityGamesRngOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                // Find parent's commission for this category and site
                const parentCommission = await tx.commission.findFirst({
                  where: {
                    userId: parentUser.id,
                    categoryId: specialtyGamesRngCategory.id,
                    siteId: siteId
                  }
                });
                
                if (parentCommission) {
                  await tx.commission.update({
                    where: { id: parentCommission.id },
                    data: {
                      commissionPercentage: toFloat(userData.commissions.specialityGamesRngOwn)
                    }
                  });
                }
              }
            }

            // Handle specialtyGames commission
            const specialtyGamesToteCategory = findCategory(
              "Speciality Games - Tote"
            );
            // console.log({ specialtyGamesCategory });
            if (specialtyGamesToteCategory) {
              const existingSpecialityGamesComm =
                existingCommissions["Speciality Games - Tote"];
              if (
                userData.commissions.specialityGamesTote !== undefined ||
                existingSpecialityGamesComm
              ) {
                await this.updateCommission(tx, {
                  userId: existingUser.id,
                  siteId,
                  categoryId: specialtyGamesToteCategory.id,
                  totalAssignedCommissionPercentage:
                    userData.commissions.specialityGamesTote !== undefined
                      ? toFloat(userData.commissions.specialityGamesTote)
                      : existingSpecialityGamesComm?.commissionPercentage || 0,
                  settlementPeriod:
                    userData.settlementDetails?.period ||
                    existingSpecialityGamesComm?.commissionComputationPeriod,
                  updatedBy: currentUser.id,
                });
              }

              console.log({userDataCommissions: userData.commissions.specialityGamesToteOwn});

              // Update parent's commission if "Own" values are provided
              if (userData.commissions.specialityGamesToteOwn !== undefined && currentUserRole.name !== UserRole.SUPER_ADMIN) {
                // Find parent's commission for this category and site
                const parentCommission = await tx.commission.findFirst({
                  where: {
                    userId: parentUser.id,
                    categoryId: specialtyGamesToteCategory.id,
                    siteId: siteId
                  }
                });

                console.log({parentCommission});
                
                if (parentCommission) {
                  await tx.commission.update({
                    where: { id: parentCommission.id },
                    data: {
                      commissionPercentage: toFloat(userData.commissions.specialityGamesToteOwn)
                    }
                  });
                }
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
