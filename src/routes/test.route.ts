import * as TestController from "../controllers/test.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const TestRouter = express.Router();

TestRouter.get(
    "/", 
    authenticateUserByAccessToken, 
    TestController.getAllTests
);

TestRouter.get(
  "/:id",
  authenticateUserByAccessToken,
  TestController.getTestById
);

export default TestRouter;
