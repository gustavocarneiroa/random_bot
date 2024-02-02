import { Client, GatewayIntentBits } from 'discord.js';
import { CommandsService } from '../commands/command.service';
import { GatewayService } from '../gateways/gateway.service';
import { EventEmitter } from '../event_command/eventCommand.emitter';
import { IGateway } from '../gateways/MessageGateways';
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const TOKEN = process.env.DISCORD_TOKEN;
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on('messageCreate', async (messageController) => {
    if(messageController.author.bot) { return; }
    const gatewayConverter = await GatewayService.getFromDiscord(messageController.channelId)
    if (!gatewayConverter) {
        return;
    }
    const messageInfo = {
        username: messageController.author.globalName,
        target: '',
        command: '',
    }

    if(messageController.content.includes("!bot")) {
        const commandData = await CommandsService.get()
        const commands = commandData.filter( commandList => commandList.data.map( command => command.channel).includes(gatewayConverter.twitch_channel));
        const message = commands.map( commandList => `${commandList.command}` ).join(" | ")
        messageController.reply(message)

        return;
    }
    const regexMessageCorrespondence = messageController.content.match(/!(\S+)\s*(.*)/);
    if (regexMessageCorrespondence) {
        [,messageInfo.command, messageInfo.target] = regexMessageCorrespondence ?? [];
    }
    EventEmitter.emit(messageInfo.command, {
        origin: gatewayConverter.twitch_channel,
        gateway: "discord",
        user: messageInfo.username,
        target: messageInfo.target,
    });
})

client.login(TOKEN);


export const DiscordClient = client;

export class DiscordGateway implements IGateway {
    public sendMessage(channel: string, message: string): void {
        GatewayService.getFromTwitch(channel).then( data => {
            const channelClient = client.channels.cache.get(data.discord_server) as any;
            ;(async () => channelClient?.send?.(message))();
        });
    }

    public join(channel: string) {
        console.log("Discord command already inserted on channel" + channel)
    }
}