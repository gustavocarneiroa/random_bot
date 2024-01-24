import { Command, baseCommandSchema, commandSchemasByType } from "./command.entity";
import { CommandsService } from "./command.service";

export class CommandsController {
    static async get(req, res) {
            const commands = await CommandsService.get();
            res.json(commands);
    }

    static async create(req, res) {
        try {
            const props: Command = {
                ...req.body,
            }
            const schema = baseCommandSchema.merge(commandSchemasByType[req.body.type]);
            schema.parse(props);
            const event = await CommandsService.create(props);
            res.json(event);

        } catch (err) {
            res.json(err)
        }
    }

    static async remove(req, res) {
        const { channel, command } = req.body;
        const removedCommand = await CommandsService.remove(command, channel);
        res.json(removedCommand)
    }
}