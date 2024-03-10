import { DiscordGateway } from "../clients/discord.client";
import { TwitchGateway } from "../clients/twitch.client";
// import { WhatsAppGateway } from "../clients/whatsapp.client";

export interface IGateway {
    sendMessage(channel: string, message: string, metadata?: any) : void;
    join(channel: string) : void;
}

export class MessageGateway {
    static get(gateway: string): IGateway {
        const gateways = {
            twitch: TwitchGateway,
            discord: DiscordGateway,
            // whatsapp: WhatsAppGateway,
        };
        return gateways[gateway] ? new gateways[gateway] : undefined;
    }

    static validateChannel(channelName: string, origin: string) {
        if (channelName === "whatsapp") {
            return origin;
        }

        return channelName;
    }
}