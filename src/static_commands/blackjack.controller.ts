import { MessageGateway } from "../gateways/MessageGateways";
import { Battle, Moves } from "./battle";
import { BlackjackGame } from "./blackjack";
export const blackjackCommands = ["!vinte1", "!hit", "!stand"];
export const _blackjackCommands = ["vinte1", "hit", "stand"];
const games: BlackjackGame[] = [];

type EmitterData = {
    origin: string;
    gateway: string,
    user: string,
    target: string,
    metadata?: any,
}

function validateUser(user: string) {
    if(!user.startsWith("@")) {
        user = "@"+user;
    }

    return user;
}

export class BlackjackController {
    static handleCommand(command: string, data: EmitterData) {
        return BlackjackController[command]?.(data)
        
    }
    static async send(data: EmitterData, message: string) {
        if(!message) {
            return;
        }
        const gatewayName = data.gateway;
        const gateway = MessageGateway.get(gatewayName);
        await gateway.sendMessage(data.origin, message);
    }
    static searchPlayerInGames(user: string): { message: string, gameIndex: number } {
        for (const [index, game] of games.entries()) {
            if (game.playerIds.includes(user)) {
                if (game.gameOver) {
                    games.splice(index, 1);
                } else {
                    return {
                        gameIndex: index,
                        message: `${user}, você já está jogando um 21. Existem leis aqui.`
                    }
                }
            }
        }

        return {
            gameIndex: -1,
            message: null
        }
    }
    static async vinte1(data: EmitterData) {
        const user = validateUser(data.user);
        const finderReturn = BlackjackController.searchPlayerInGames(user);
        let message = finderReturn.message;
        if(finderReturn.gameIndex < 0) {
            const game = new BlackjackGame(true);
            games.push(game);
            message = game.addNewPlayer(user);
        }
        await BlackjackController.send(data, message);
    }

    static async hit(data: EmitterData) {
        const user = validateUser(data.user);
        const { gameIndex } = BlackjackController.searchPlayerInGames(user);
        let message = "Você ainda não está jogando.";
        if (gameIndex >= 0) {
            const game = games[gameIndex];
            const result = game.hit(user);
            if(result.gameOver) {
                message = `${user} ${result.result}`;
            }

            const hand = game.hand(user).join(" | ");
            message = `Mão de ${user}: ${hand}`;

        }

        await BlackjackController.send(data, message);
    }
}