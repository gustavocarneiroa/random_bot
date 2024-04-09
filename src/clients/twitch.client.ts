import * as tmi from "tmi.js"
import { EventEmitter } from "../event_command/eventCommand.emitter";
import { CommandsService } from "../commands/command.service";
import { IGateway } from "../gateways/MessageGateways";
import { BattleController, _battleCommands } from "../static_commands/battle.controller";
import { BlackjackController, _blackjackCommands } from "../static_commands/blackjack.controller";
const opts: tmi.Options = {
    options: { debug: true },
    identity: { username: process.env.BOT_USER, password: process.env.BOT_AUTH },
    channels: []
};

const client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

function onConnectedHandler(address: string, port: number) {
    console.log(`* Connected to ${address}:${port}`);
}

function onMessageHandler(channel: string, userstate: any, message: string, self: boolean) {
    if (self) { return; } 
    if(!message.startsWith("!")) { return; }
    const messageInfo = {
        username: userstate.username,
        target: '',
        command: '',
    }

    if(message.includes("!bot")) {
        CommandsService.get().then( commandData => {
            const commands = commandData.filter( commandList => commandList.data.map( command => `#${command.channel}`).includes(channel));
            const message = commands.map( commandList => `${commandList.command}` ).join(" | ")
            client.say(channel, "Comandos: \n\r " + message)
        })

        return;
    }

    const regexMessageCorrespondence = message.match(/!(\S+)\s*(.*)/);
    if (regexMessageCorrespondence) {
        [,messageInfo.command, messageInfo.target] = regexMessageCorrespondence ?? [];
    }

    const data = {
        origin: channel,
        gateway: "twitch",
        user: messageInfo.username,
        target: messageInfo.target,
    }
    if(_battleCommands.includes(messageInfo.command)) {
        BattleController.handleCommand(messageInfo.command, data)
        return;
    }
    if(_blackjackCommands.includes(messageInfo.command)) {
        BlackjackController.handleCommand(messageInfo.command, data)
        return;
    }

    EventEmitter.emit(messageInfo.command, data);
}

export const TwitchClient = client;
export class TwitchGateway implements IGateway {
    public sendMessage(channel: string, message: string): void {
        client.say(channel, message)
    }

    public join(channel: string) {
        client.join(channel)
    }
}