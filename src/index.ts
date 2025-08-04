import dotenv from "dotenv";
import Server from "./server";
import { Request, Response } from "express";
import nodeCron from "node-cron";

// Importation des routers
import TestRouter from "./routes/test.route";
import AuthRouter from "./routes/auth.route";
import UserRouter from "./routes/user.route";
import WalletRouter from "./routes/wallet.route";

// Importation de Controlleur... Cas speciale.
import { socketCheckTransactionState } from "./controllers/wallet.controller";

dotenv.config();
const PORT = Number(process.env.PORT ?? 3500);

const server = new Server(PORT);

server.start();

// appels vers tout les routeurs de base...
server.use("/api/test", TestRouter);
server.use("/api/auth", AuthRouter);

// appels vers toutes les routes authentifiées...
server.use("/api/wallet", WalletRouter);
server.use("/api/me", UserRouter);

// petit get Test...
server.get("/dev", (req: Request, res: Response) => {
  res.send("Bienvenue sur le INVESTIA API...");
});

// Action repetitive...
nodeCron.schedule("* * * * *", async () => {
  console.log("Checking Every Transactions...");
  await socketCheckTransactionState();
});
