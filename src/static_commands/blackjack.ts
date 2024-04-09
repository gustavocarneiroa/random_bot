import { shuffleArray } from "../common/utils";

type Deck = Card[];
type Card = {
    number: number;
    displayNumber: string;
    suit: Suit;
}
type Suit = "♥️" | "♣️" | "♦️" | "♠️"
type GameResult = {
    gameOver: boolean;
    result?: string | null,
}
function createNewDeck(): Deck {
    const naipes: Suit[]  = ["♥️", "♣️", "♦️", "♠️"];
    const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13];
    const dictionary = {
        1: "A",
        11: "J",
        12: "Q",
        13: "K",
    }
    const _deck: Deck = naipes.map( suit => numbers.map( number => ({
        number: number,
        displayNumber: dictionary[number] ?? String(number),
        suit: suit,
    } as Card))).reduce((main, n) => main.concat(n));
    return shuffleArray<Card>(_deck)
}

class PlayerBj {
    public readonly cards: Deck = [];
    public is_bot: boolean = false;
    public result?: string;
    constructor(public readonly name: string, is_bot = false) {
        this.is_bot = is_bot;
    }
}

export class BlackjackGame {
    private deck: Deck = createNewDeck()
    player1: PlayerBj = null;
    player2: PlayerBj = null;
    playerIds: string[] = [];
    gameOver: boolean = false;
    result: string | undefined;
    constructor(is_vs_bot = false) {
        if(is_vs_bot) {
            this.player2 = new PlayerBj("gustavinho_intruso_bot", true);
            this.playerIds.push("gustavinho_intruso_bot");
        }
    }
    getPlayerByUsername(user: string): { player: PlayerBj, opponent: PlayerBj } {
        if(this.player1.name == user) {
            return {
                player: this.player1,
                opponent: this.player2,
            }
        } 

        return {
            player: this.player2,
            opponent: this.player1,
        }
    }
    addNewPlayer(user: string): string {
        if(this.playerIds.length >= 2) {
            return `Todos os jogadores já estão na partida.`
        }
        let initial_message = ""
        if(!this.player1) {
            this.player1 = new PlayerBj(user);            
            initial_message = `${user} criou uma jogatina de 21.`;
        }
        if(!this.player2) {
            this.player2 = new PlayerBj(user);
            initial_message = `${user} está agora participando da jogatina. `;
        }
        this.playerIds.push(user);
        this.hit(user);
        this.hit(user);
        const cards = this.hand(user);
        return `${initial_message}  Mão inicial: ${cards.join(' | ')}`;
    }
    hand(user: string): string[] {
        const { player } = this.getPlayerByUsername(user);
        return player.cards.map(number => number.displayNumber + number.suit);
    }

    hit(user: string): GameResult {
        const { player } = this.getPlayerByUsername(user)
        if(!player.result) {
            const card = this.deck.pop();  
            player.cards.push(card);
        }
        return this.checkResult(user);
    }

    checkResult(user: string): GameResult {
        const { player } = this.getPlayerByUsername(user)
        const result = player.cards.reduce((acc, num) => acc += num.number, 0);
        if(result > 21) {
            this.gameOver = true;
            this.result = "ESTOURADO";
            player.result = "lost";
        } else if(result === 21) {
            this.gameOver = true;
            this.result = "10 miLHÇIEs de KWANZEAS";
            player.result = "won";
        } 
        return {
            gameOver: this.gameOver,
            result: this.result,
        }
    }
}