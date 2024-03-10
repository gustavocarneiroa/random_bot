// import * as qrcode from "qrcode-terminal"
// import WAWebJS, { Client, LocalAuth } from "whatsapp-web.js";
// import { IGateway } from "../gateways/MessageGateways";
// import { CommandsService } from "../commands/command.service";
// import { EventEmitter } from "../event_command/eventCommand.emitter";
// import { BattleController, _battleCommands, battleCommands } from "../static_commands/battle.controller";

// const client = new Client({
//     authStrategy: new LocalAuth({clientId: "teste"})
// });

// client.on('qr', (qr) => {
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//     console.log('Connected to Whatsapp Web');
// });
// client.on("auth_failure", (...args) => console.log(args))
// client.on("loading_screen", (percentage, message) => console.log(percentage, "% =>", message))
// client.on("disconnected", (reason) => console.log(reason));
// client.on('message', onMessageHandler);

// async function onMessageHandler(messageBody: WAWebJS.Message) {
//     const message = messageBody.body;
//     const channel = `#${messageBody.from}`;
//     const user = await messageBody.getContact();
//     if(!messageBody.body.startsWith("!")) { return; }
//     const messageInfo = {
//         username: user.id.user,
//         target: '',
//         command: '',
//     }

//     if(message.includes("!bot")) {
//         CommandsService.get().then( commandData => {
//             const commands = commandData.filter( commandList => commandList.data.map( command => command.channel).includes("whatsapp"));
//             const message = commands.map( commandList => `${commandList.command}` ).concat(battleCommands).join(" | ")
//             client.sendMessage(messageBody.from, "Comandos: \n\r " + message)
//         })

//         return;
//     }

//     const regexMessageCorrespondence = message.match(/!(\S+)\s*(.*)/);
//     if (regexMessageCorrespondence) {
//         [,messageInfo.command, messageInfo.target] = regexMessageCorrespondence ?? [];
//     }
//     const data = {
//         origin: channel,
//         gateway: "whatsapp",
//         user: messageInfo.username,
//         target: messageInfo.target,
//         metadata: {
//             user
//         }
//     }
//     if(_battleCommands.includes(messageInfo.command)) {
//         BattleController.handleCommand(messageInfo.command, data)
//         return;
//     }

//     EventEmitter.emit(messageInfo.command, data);
// }

// client.initialize().then( () => console.log("Trying to connect to Whatsapp..."));

// export const WhatsAppClient = client;
// export class WhatsAppGateway implements IGateway {
//     public sendMessage(channel: string, message: string): void {
//         const [, channelToSend] = channel.split("#");
//         const mentionRegex = /@(\w+)/g;
//         const numberRegex = /^[0-9]+$/;
//         const mentionMatches = message.match(mentionRegex);
//         const mentionFilter = mentionMatches?.filter( mention => numberRegex.test(mention.slice(1))) ?? [];
//         const mentions: any[] = mentionFilter?.map((mention) => mention.slice(1) + "@c.us") ?? [];
//         client.sendMessage(channelToSend, message, {
//             mentions
//         });
//     }

//     public join(channel: string) {
//         console.log("Channel ::", channel);
//         return;
//     }
// }