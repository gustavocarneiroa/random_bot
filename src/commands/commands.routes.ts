import express from "express";
import { CommandsController } from "./command.controller";
const router = express.Router();

router
    .route("/")
    .get(CommandsController.get)
    .put(CommandsController.update)
    .post(CommandsController.create)
    .delete(CommandsController.remove)

export const CommandRouter = router;