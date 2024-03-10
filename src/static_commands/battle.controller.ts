import { MessageGateway } from "../gateways/MessageGateways";
import { Battle, Moves } from "./battle";
export const battleCommands = ["!battle", "!accept", "!attack", "!block", "!moves", "!ff"];
export const _battleCommands = ["battle", "accept", "attack", "block", "moves", "ff"];
const battles: Battle[] = [];

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

export class BattleController {
    static handleCommand(command: string, data: EmitterData) {
        return BattleController[command]?.(data)
        
    }
    static async send(data: EmitterData, message: string) {
        if(!message) {
            return;
        }
        const gatewayName = data.gateway;
        const gateway = MessageGateway.get(gatewayName);
        await gateway.sendMessage(data.origin, message);
    }
    static searchPlayerInBattles(user: string): { message: string, battleIndex: number } {
        for (const [index, battle] of battles.entries()) {
            if (battle.playerIds.includes(user)) {
                if (battle.gameEnded) {
                    battles.splice(index, 1);
                } else {
                    return {
                        battleIndex: index,
                        message: `${user}, você já está em um duelo. Existem leis aqui.`
                    }
                }
            }
        }

        return {
            battleIndex: -1,
            message: null
        }
    }
    static async battle(data: EmitterData) {
        const user = validateUser(data.user);
        const finderReturn = BattleController.searchPlayerInBattles(user);
        let message = finderReturn.message;
        if(finderReturn.battleIndex < 0) {
            const battle = new Battle();
            battles.push(battle);
            message = battle.addNewPlayer(user);
        }
        await BattleController.send(data, message);
    }

    static async accept(data: EmitterData) {
        const user = validateUser(data.user);
        const opponent = validateUser(data.target);
        let message = "Duelo não encontrado";
        let battleStarted = false;
        const { battleIndex } = BattleController.searchPlayerInBattles(opponent);
        console.log(battles, battleIndex)
        if(battleIndex >= 0) {
            const battle = battles[battleIndex];
            message = battle.addNewPlayer(user);
            battleStarted = true;
        }
        await BattleController.send(data, message);
        if(battleStarted) {
            BattleController.moves(data);
        }
    }

    static async moves(data: EmitterData) {
            const battle_message = `
        ⚔️ !attack => Joga um D20 de dano. Se falha crítica, causa um D6 a si mesmo e 0 ao inimigo. Se 18, 19 ou 20, o ataque não é bloqueável. Se 20, causa 30 de dano.
            
        🛡️ !block => Joga um D20 de teste. Se falha crítica, causa um D3 a si mesmo e falha em defender o ataque. Se 20, bloqueia 20 de dano e causa 10 de dano Counter. Em outros casos, há 50% de chance de reduzir 5 de dano do atacante.
        
        🛡️ 🛡️ Se dois bloquearem, nada acontece.
        `
        await BattleController.send(data, battle_message);
    }

    static async attack(data: EmitterData) {
        const user = validateUser(data.user);
        const { battleIndex } = BattleController.searchPlayerInBattles(user);
        console.log(battles, battleIndex);
        let message = "Você ainda não está em batalha";
        if (battleIndex >= 0) {
            const battle = battles[battleIndex];
            message = battle.move(user, Moves.ATTACK);
        }

        await BattleController.send(data, message);
    }

    static async block(data: EmitterData) {
        const user = validateUser(data.user);
        const { battleIndex } = BattleController.searchPlayerInBattles(user);
        let message = "Você ainda não está em batalha";
        if (battleIndex >= 0) {
            const battle = battles[battleIndex];
            message = battle.move(user, Moves.BLOCK);
        }

        await BattleController.send(data, message);
    }
}