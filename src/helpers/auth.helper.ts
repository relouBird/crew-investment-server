import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user.model";

// Middleware pour vérifier et extraire les infos utilisateur
export const authenticateUserByAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const userModelInstance = new UserModel();
  let isError = false;
  let errorMessage = "";

  console.log("\n");
  console.log("authorization =>", authHeader);

  if (!authHeader || !authHeader.includes("Bearer")) {
    res.status(401).json({
      message: "Access Unauthorized",
      details: "Your request doesn't have a token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  const user = await userModelInstance.get(token, (error) => {
    isError = true;
    errorMessage = error?.message ?? "";
  });

  if (isError || !user) {
    res.status(401).json({
      message: "Access Unauthorized",
      details: errorMessage || "Invalid or expired token",
    });
    return;
  }

  // Injection de l'utilisateur dans la requête
  (req as any).user = user;

  next(); // continue la chaîne des middlewares
};
