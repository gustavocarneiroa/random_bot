import { Command } from "../commands/command.entity";
import { EventCommand } from "./eventCommand.entity";
import { EventEmitter } from "./eventCommand.emitter";
import { TwitchClient } from "../clients/twitch.client";

export class EventsRepository {
    static async showCommands() {
        const keys = Array.from(EventEmitter.events.keys());
        const commandArray = keys.map( key => {
            const events = EventEmitter.events.get(key);
            const eventsInfo = events.map( event => {
                return {
                    channel: event.channel,
                    messages: event.messages,
                }
            }) 
            return {
                command: key,
                data: eventsInfo
            }
        })

        return commandArray;
    }

    static async create(topic: string, props: Command) {
        const event = new EventCommand(props);
        EventEmitter.subscribe(topic, event);
        
        return event
    }

    static async update(topic: string, channel: string, props: Command) {
        const updatedCommand = new EventCommand(props)
        await EventEmitter.update(topic, channel, updatedCommand)

        return updatedCommand
    }

    static async remove(topic: string, channel: string) {
        EventEmitter.unsubscribe(topic, channel);

        return {}
    }

    static async join(channel: string) {
        await TwitchClient.join(channel)
    }
}