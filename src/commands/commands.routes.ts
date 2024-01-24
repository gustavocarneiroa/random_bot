import express from "express";
import { CommandsController } from "./command.controller";
const router = express.Router();

router
    .route("/")
    .get(CommandsController.get)
    .post(CommandsController.create)
    .delete(CommandsController.remove)

export const CommandRouter = router;