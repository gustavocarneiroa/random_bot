import "reflect-metadata";
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { CommandRouter } from "./commands/commands.routes";
import { CommandsService } from "./commands/command.service";

const app = express();
app.use(express.json());
app.use(CommandRouter);


setTimeout(() => CommandsService.sync(), 3000);

const port = process.env.PORT;
app.listen(port, () => console.log(`Connected at ${port}`))