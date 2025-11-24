import dotenv from "dotenv";
import Server from "./server";
import { Request, Response } from "express";
import nodeCron from "node-cron";

// Importation des routers
import TestRouter from "./routes/test.route";
import AuthRouter from "./routes/auth.route";
import UserRouter from "./routes/user.route";
import WalletRouter from "./routes/wallet.route";
import TransactionRouter from "./routes/transaction.route";
import AdminUserRouter from "./routes/admin-user.route";
import AdminBetRouteur from "./routes/admin-bet.route";
import BetRouteur from "./routes/bet.route";

// // Importation de Controlleur... Cas speciale.
// import {
//   socketCheckPaymentState,
//   socketCheckWithdrawState,
// } from "./controllers/wallet.controller";

dotenv.config();
const PORT = Number(process.env.PORT ?? 3500);

const server = new Server(PORT);

server.start();

// appels vers tout les routeurs de base...
server.use("/api/test", TestRouter);
server.use("/api/auth", AuthRouter);

// appels vers toutes les routes authentifiées...
server.use("/api/me", UserRouter);
server.use("/api/wallet", WalletRouter);
server.use("/api/transaction", TransactionRouter);
server.use("/api/bets", BetRouteur);

// appels vers toutes les routes admin...
server.use("/api/admin/users", AdminUserRouter);
server.use("/api/admin/bets", AdminBetRouteur);

// petit get Test...
server.get("/dev", (req: Request, res: Response) => {
  res.send("Bienvenue sur le INVESTIA API...");
});

// Action repetitive pour controler le depot effectué...
nodeCron.schedule("* * * * *", async () => {
  console.log("Checking Every Deposit...");
  // await socketCheckPaymentState();
});

// Action repetitive pour controler les retraits effectué...
nodeCron.schedule("*/3 * * * *", async () => {
  console.log("Checking Every Withdraw...");
  // await socketCheckWithdrawState();
});

// Action repetitive...
nodeCron.schedule("0 0 * * *", async () => {
  console.log("Send email to all users...");
  // await socketCheckTransactionState();
});
