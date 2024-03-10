import { d } from "../common/utils";

export enum Moves { 
    ATTACK = "attack",
    BLOCK = "block",
}

type Damage = {
    type: Moves;
    itself: number;
    other: number;
    defense: number,
    critical_failure: boolean,
    critical_success: boolean,
    defensable: boolean,
}
export class Battle {
    private player1 = new Player()
    private player2 = new Player()
    private readonly failure_critical = 1;
    private readonly critical = 20;
    private readonly non_defensable = [17, 18,19];
    private readonly evade_rate = 0.3;
    private players: { [key: string]: Player } | {} = {}
    playerIds: string[] = [];
    private queue: { [key: string]: Moves } | {} = {}
    gameEnded = false;
    addNewPlayer(playerId: string) {
        if (!this.player1.isSetted()) {
            this.player1.joinAs(playerId);
            this.players[playerId] = this.player1;
            this.playerIds.push(playerId)
            return `${playerId} criou uma batalha. Digite !accept para participar. Limite de 1 oponente.`;
        } 
        if (!this.player2.isSetted()) {
            this.player2.joinAs(playerId);
            this.players[playerId] = this.player2;
            this.playerIds.push(playerId)
            return `👊 ${playerId} aceitou a batalha de ${this.player1.playerId}. 👊 `;
        } 

        
        return "🚨 Lista de participantes está encerrada. 🚨";
    }

    move(playerId: string, move: Moves) {
        if(this.gameEnded) {
            return "🚨 Duelo encerrado."
        }
        if(!this.player1.isSetted() || !this.player2.isSetted()) {
            return `Calma ${playerId} 😳😳😳😳. O duelo ainda não começou`;
        }
        if(!this.queue[playerId]) {
            this.queue[playerId] = move
        }

        if(!this.isQueueOnWait()) {
           return this.turnStart()
        } else {
            return ``
        }
    }

    turnStart() {
        if(!this.queue[this.player1.playerId] || !this.queue[this.player2.playerId]) {
            return ``;
        }
        const uniqueAction = [...new Set(Object.values(this.queue))];
        if( ["block"].includes([...new Set(Object.values(this.queue))].join())) {
            this.queue = {}
            return `${this.player1.playerId} e ${this.player2.playerId} tentaram ${uniqueAction} ao mesmo tempo. Nada aconteceu.`
        }
        const actions: { [key in Moves]: () => Damage} = {
            attack: () => this.attack(),
            block: () => this.block(),
            // evade: () => this.evade(),
        }

        const move1 = this.queue[this.player1.playerId] as Moves;
        const move2 = this.queue[this.player2.playerId] as Moves;

        const p1Action = actions[move1]();
        const p2Action = actions[move2]();
        
        const player1MoveToPlayer2 = this.calculateDamage(p1Action, p2Action);
        const player2MoveToPlayer1 = this.calculateDamage(p2Action, p1Action);

        const player1Damaged = player1MoveToPlayer2.taken + player2MoveToPlayer1.given;
        const player2Damaged = player2MoveToPlayer1.taken + player1MoveToPlayer2.given;

        if(this.player1.willDie(player1Damaged)) {
            player2MoveToPlayer1.wilKill = true;
        }

        if(this.player2.willDie(player2Damaged)) {
            player1MoveToPlayer2.wilKill = true;
        }

        
        if(player1MoveToPlayer2.wilKill && player2MoveToPlayer1.wilKill) {
            this.gameEnded = true;
            return `${this.player1.playerId} e ${this.player2.playerId} trocaram o último soco. Ao mesmo tempo, ambos chegam a 0. O duelo se encerra num empate, o único vitorioso sendo a platéia.`
        }

        this.player1.life -= player1Damaged;
        this.player2.life -= player2Damaged;

        if(this.player2.isDead()) {
            this.gameEnded = true;
            return `${this.player1.playerId} defere um soco BRABO em ${this.player2.playerId}. Não havia mais o que fazer. O jogo se encerra com o desafiador vencendo.`
        }

        if(this.player1.isDead()) {
            this.gameEnded = true;
            return `${this.player2.playerId} não perde tempo e encerra a soberba de ${this.player1.playerId}. O desafiado provou seu valor, vencendo o duelo.`
        }


        
        this.queue = {}
        return `Resultados do turno: \n
${this.formatDamageMessage(this.player1, p1Action, player1Damaged)}\n
${this.formatDamageMessage(this.player2, p2Action, player2Damaged)}\n`

        
    }
    isQueueOnWait() {
        const playerIds = [this.player1.playerId, this.player2.playerId]
        for (const id of playerIds) {
            if(!!this.queue[id]) {
                return false;
            }
        }

        return true;
    }

    attack(): Damage {
        const value = d(20);
        const damageData = {
            type: Moves.ATTACK,
            itself: 0,
            other: value,
            defense: 0,
            critical_failure: false,
            critical_success: false,
            defensable: true,
        }
        if(this.failure_critical == value) {  
            Object.assign(damageData , {
                itself: d(6),
                other: 0,
                critical_failure: true,
            })
        } else if(this.critical == value) {
            Object.assign(damageData , {
                other: 30,
                critical_success: true,
                defensable: false,
            })
        } else if (this.non_defensable.includes(value)) {
            damageData.defensable = false;
        }

        return damageData;
    }

    block(): Damage {
        const value = d(20);
        const damageData = {
            type: Moves.BLOCK,
            itself: 0,
            other: 0,
            defense: 0,
            critical_failure: false,
            critical_success: false,
            defensable: false,
        }
        if(this.failure_critical == value) {  
            Object.assign(damageData, {
                itself: d(6),
                other: 0,
                critical_failure: true,
            })
            return damageData;
        }

        if(this.critical == value) {
            Object.assign(damageData , {
                other: 20,
                defense: 30,
                critical_success: true,
                defensable: false,
            })
            return damageData;
        }   
        damageData.defense = value;
        

        return damageData;
    }

    calculateDamage(attacker, defenser) {
        if(!attacker.defensable && !defenser.critical_success) {
            defenser.defense = 0;
        }

        let attackerDamaged = attacker.itself + (defenser.type == "defense" ? defenser.other : 0) - attacker.defense;
        if (attackerDamaged < 0) {
            attackerDamaged = 0;
        }

        let defenserDamaged = attacker.other + (defenser.type == "defense" ? defenser.other : 0) - defenser.defense;
        if (defenserDamaged < 0) { 
            defenserDamaged = 0
        }

        return {
            wilKill: false,
            taken: attackerDamaged,
            given: defenserDamaged,
        }

    }
    reset() {
        if(!this.gameEnded) {
            return;
        }
        this.players = {}
        this.queue = {}
        this.player1 = new Player()
        this.player2 = new Player()
    }

    formatDamageMessage(player: Player, action: Damage, damageTaken: number) {
        const moveEmoji = {
            attack: "⚔️",
            block: "🛡️"
        }
        const success =  action.critical_success ? "| *CRÍTICO* |" : "";
        const fail = action.critical_failure ? "| *FALHA CRÍTICA* |" : "";
        const damage = damageTaken * -1;
        return `${moveEmoji[action.type]} ${player.playerId}: 🩸 ${player.life} => ${success}${fail} Dano Recebido: ${damage}`
    }
}

class Player {
    public life = 100;
    public playerId: string = undefined;
    public dead = false;
    joinAs(playerId: string) {
        this.playerId = playerId;
    }
    isSetted(): boolean {
        return !!this.playerId;
    }
    isDead(): boolean {
        return this.life <= 0;
    }
    willDie(value: number): boolean {
        return this.life - value <= 0;
    }
}