import * as SponsoringController from "../controllers/sponsoring.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const SponsoringRouter = express.Router();

SponsoringRouter.get(
  "/",
  authenticateUserByAccessToken,
  SponsoringController.all
);

SponsoringRouter.post(
  "/",
  authenticateUserByAccessToken,
  SponsoringController.create
);

SponsoringRouter.get(
  "/:id",
  authenticateUserByAccessToken,
  SponsoringController.get
);

SponsoringRouter.patch(
  "/:id",
  authenticateUserByAccessToken,
  SponsoringController.update
);

SponsoringRouter.delete(
  "/:id",
  authenticateUserByAccessToken,
  SponsoringController.DeleteSponsoring
);

export default SponsoringRouter;
