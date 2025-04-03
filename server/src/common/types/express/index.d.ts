import { Role, User } from "../../../../prisma/generated/prisma";

declare global {
  namespace Express {
    export interface Request {
      user: User;
      role: string;
    }
  }

  // namespace Models {
  //   export type PlayerRepository = Repository<Player>;

  //   export type DepositRepository = Repository<Deposit>;
  //   export type WithdrawRepository = Repository<Withdraw>;
  //   export type WalletRepository = Repository<Wallet>;
  // }
}
