import { Command } from "./command.entity";
import { EventCommand } from "../event_command/eventCommand.entity";
import { CommandRepository } from "./command.repository";
import { EventsRepository } from "../event_command/eventCommand.repository";


type CommandList = {
    command: string;
    data: {
        channel: string;
        messages: string[];
    }[]
}
export class CommandsService {
    static async get(): Promise<CommandList[]> {
        return await EventsRepository.showCommands()
    }

    static async sync(): Promise<void> {
        console.log("Sync commands...")
        try {
            const commands = await CommandRepository.findAll();
            let channels = []
            for (const command of commands) {
                await EventsRepository.create(command.command, command);
                channels.push(command.channel)
            }
            channels = [...new Set(channels)];
            for (const channel of channels) {
                if (!channel.includes("whatsapp")) {
                    await EventsRepository.join(channel, "twitch");
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    static async validateUniqueness(props: Command) {
        const countCommands = await CommandRepository.count(props.channel, props.command);
        if(countCommands > 0) {
            throw new Error("commands_already_exists_on_channel");
        }
    }

    static async create(props: Command): Promise<EventCommand> {
        const command = await CommandRepository.insert(props);
        const event = await EventsRepository.create(command.command, command);
        try {
            if (!command.channel.includes("whatsapp")) {
                await EventsRepository.join(command.channel, "twitch");
            }
        } catch (err) {
            console.error(err)
        }
        return event
    }

    static async update(commandName: string, channel: string, command: Partial<Command>) {
        const updatedCommand = await CommandRepository.update(commandName, channel, command);
        await EventsRepository.update(commandName, channel, updatedCommand);
        return updatedCommand;
    }

    static async remove(commandName: string, channel: string) {
        const command = await CommandRepository.remove(commandName, channel);
        await EventsRepository.remove(commandName, channel);

        return command
    }

    static async channels(): Promise<string[]> {
        const command = await CommandRepository.channels();
        return command;
    }
}