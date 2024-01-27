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
            await CommandsService.validateUniqueness(props);
            const event = await CommandsService.create(props);
            res.json(event);

        } catch (err) {
            res.json({
                error: err?.message ?? "Unexpected error"
            })
        }
    }

    static async update(req, res) {
        const { channel, command, ...partialCommand } = req.body;
        const updatedCommand = await CommandsService.update(command, channel, partialCommand as Partial<Command>);
        res.json(updatedCommand)
    }

    static async remove(req, res) {
        const { channel, command } = req.body;
        const removedCommand = await CommandsService.remove(command, channel);
        res.json(removedCommand)
    }
}