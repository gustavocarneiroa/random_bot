import { Command } from "./command.entity";
import { CommandsService } from "./command.service";

export class CommandsController {
    static async get(req, res) {
        const commands = await CommandsService.get();
        res.json(commands);
    }

    static async create(req, res) {
        const props: Command = {
            ...req.body,
        }
        const event = await CommandsService.create(props);
        res.json(event);

    }

    static async remove(req, res) {
        const { channel, command } = req.body;
        const removedCommand = await CommandsService.remove(command, channel);
        res.json(removedCommand)
    }
}