import { GatewayConverter } from "./GatewayConverter.entity";
import { GatewayRepository } from "./gateway.repository";

export class GatewayService {
    static async getFromDiscord(discord_server: string) : Promise<GatewayConverter> {
        const gateway = await GatewayRepository.get({discord_server : discord_server})
        return gateway;
    }

    static async getFromTwitch(twitch_channel: string) : Promise<GatewayConverter> {
        const gateway = await GatewayRepository.get({twitch_channel: twitch_channel})
        return gateway;
    }

    static async createDiscordConnection(gatewayDTO: Partial<GatewayConverter>) : Promise<GatewayConverter> {
        const gateway = await GatewayRepository.insert(gatewayDTO)
        return gateway
    }
}