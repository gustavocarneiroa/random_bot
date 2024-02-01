import * as tmi from "tmi.js"
import { EventEmitter } from "../event_command/eventCommand.emitter";
import { CommandsService } from "../commands/command.service";
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

    EventEmitter.emit(messageInfo.command, {
        origin: channel,
        user: messageInfo.username,
        target: messageInfo.target,
    });
}

export const TwitchClient = client;