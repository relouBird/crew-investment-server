import dotenv from "dotenv";
import Server from "./server";
import { Request, Response } from "express";

// Importation des routers
import TestRouter from "./routes/test.route";
import UserRouter from "./routes/user.route";
import AuthRouter from "./routes/auth.route";

dotenv.config();
const PORT = Number(process.env.PORT ?? 3500);

const server = new Server(PORT);

server.start();

// appels vers tout les routeurs
server.use("/api/test", TestRouter);
server.use("/api/auth", AuthRouter);

// petit get Test...
server.get("/dev", (req: Request, res: Response) => {
  res.send("Bienvenue sur le INVESTIA API...");
});
