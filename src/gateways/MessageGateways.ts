import { DiscordGateway } from "../clients/discord.client";
import { TwitchGateway } from "../clients/twitch.client";

export interface IGateway {
    sendMessage(channel: string, message: string) : void;
    join(channel: string) : void;
}

export class MessageGateway {
    static get(gateway: string): IGateway {
        const gateways = {
            twitch: TwitchGateway,
            discord: DiscordGateway,
        }
        return gateways[gateway] ? new gateways[gateway] : undefined
    }  
}