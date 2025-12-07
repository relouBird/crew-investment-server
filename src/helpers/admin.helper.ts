import { User } from "@supabase/supabase-js";
import { USER_TYPE, UserInvest } from "../types/user.type";
import {
  TRANSACTION_TYPE,
  UserWalletTransaction,
  UserWalletType,
} from "../types/wallet.type";

// Cette fonction calcul le solde les differentes transactions effectués par un utilisateurs et cree un objet dessus
export function getDetailsUserData(
  data: User[],
  wallets: UserWalletType[],
  transactions: UserWalletTransaction[]
) {
  let dataUsers: UserInvest[] = [];
  data.forEach((user) => {
    if (user.user_metadata.type != USER_TYPE.ADMIN) {
      let totalInvested: number = 0;
      const wallet = wallets.find((wallet) => wallet.uid == user.id);
      transactions.forEach((trans) => {
        if (
          trans.creator_id == user.id &&
          trans.type == TRANSACTION_TYPE.DEPOSIT
        ) {
          totalInvested += trans.amount;
        }
      });

      dataUsers.push({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          balance: wallet ? wallet.funds : 0,
          totalInvested,
          profitLoss: 0,
        },
      });
    }
  });
  return dataUsers;
}
