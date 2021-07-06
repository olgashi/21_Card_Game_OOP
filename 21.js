const TWENTY_ONE_POINTS = 21;
const SEVENTEEN_POINTS = 17;
let readline = require("readline-sync");
const shuffle = require("shuffle-array");

class Card {
  constructor(suit, rank, faceUp = true) {
    this.suit = suit;
    this.rank = rank;
    this.faceUp = faceUp;
  }
  static RANKS = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ];
  static SUITS = ["\u2665", "\u2663", "\u2666", "\u2660"];

  getRank() {
    return this.rank;
  }

  getSuit() {
    return this.suit;
  }

  getCardFaceStatus() {
    return this.faceUp;
  }

  setCardFaceDown() {
    this.faceUp = false;
  }

  setCardFaceUp() {
    this.faceUp = true;
  }
}

class Deck {
  constructor() {
    this.deck = [];
    Card.SUITS.forEach((suit) => {
      Card.RANKS.forEach((rank) => {
        this.deck.push(new Card(suit, rank));
      });
    });

    this.shuffleCards();
  }

  shuffleCards() {
    shuffle(this.deck);
  }

  drawCard() {
    return this.deck.pop();
  }
}

class Participant {
  constructor() {
    this.score = 0;
    this.funds = 5;
    this.hand = [];
    this.handPoints = 0;
  }

  calculateHandPoints() {
    const rankToPoints = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
      10: 10, Jack: 10, Queen: 10, King: 10, Ace: 1 };
    return this.hand.reduce((acc, val) => {
      if (val.getCardFaceStatus()) return acc + rankToPoints[val.rank];
      return 0;
    }, 0);
  }

  hit(deck) {
    this.hand.push(deck.drawCard());
  }

  stay() {
    console.clear();
    console.log("Player decided to stay.");
  }

  isBusted() {
    return this.handPoints > TWENTY_ONE_POINTS;
  }

  resetHand() {
    this.hand = [];
  }

  resetHandPoints() {
    this.handPoints = 0;
  }

  getHand() {
    return this.hand
      .map((card) =>
        (card.getCardFaceStatus()
          ? `${card.getRank()} ${card.getSuit()}`
          : "Hidden Card")
      )
      .join(", ");
  }

  updateHandPoints(points) {
    this.handPoints = points;
  }
}

class Player extends Participant {
  constructor() {
    super();
  }
  static MIN_FUNDS_ALLOWED = 0;
  static MAX_FUNDS_ALLOWED = 10;

  isBroke() {
    return this.funds <= Player.MIN_FUNDS_ALLOWED;
  }

  isRich() {
    return this.funds > Player.MAX_FUNDS_ALLOWED;
  }

  deductFundsFromPlayersAccount(amount) {
    this.funds -= amount;
  }

  addFundsFromPlayersAccount(amount) {
    this.funds += amount;
  }

  showPlayersFundsAmount() {
    console.log(`Player has a total of $${this.funds}`);
  }
}

class Dealer extends Participant {
  constructor() {
    super();
  }

  revealHiddenCard() {
    this.hand.forEach((card) => {
      if (!card.getCardFaceStatus()) {
        card.setCardFaceUp();
        console.log(`Dealers hidden card: ${card.getRank()} ${card.getSuit()}`);
      }
    });
  }
}

class TwentyOneGame {
  constructor() {
    this.deck = new Deck();
    this.player = new Player();
    this.dealer = new Dealer();
  }

  static CARDS_DEALT_AT_START = 2;
  static YES = "y";
  static NO = "n";
  static HIT = "h";
  static STAY = "s";

  start() {
    this.displayWelcomeMessage();

    while (true) {
      this.playSingleGame();

      if (this.player.isBroke()) {
        console.log(`You currently have $${this.player.funds}`);
        console.log("You ran out of money and can't play anymore!");
        break;
      } else if (this.player.isRich()) {
        console.log(`You currently have $${this.player.funds}`);
        console.log("You made too much money and can't play anymore!");
        break;
      }

      if (this.playAgain()) {
        console.clear();
        this.resetGame();
      } else break;
    }

    this.displayGoodbyeMessage();
  }

  playSingleGame() {
    this.player.showPlayersFundsAmount();
    this.dealCards();
    this.playerTurn();
    this.dealerTurn();
    this.displayResult();
  }

  resetGame() {
    this.deck = new Deck();
    this.dealer.resetHand();
    this.dealer.resetHandPoints();
    this.player.resetHand();
    this.player.resetHandPoints();
  }

  playAgain() {
    let response;
    while (true) {
      console.log("");
      let prompt =
        "Would you like to play another game? Enter 'y' for yes, 'n' for no: ";
      response = readline.question(prompt).trim().toLowerCase();
      if ([TwentyOneGame.NO, TwentyOneGame.YES].includes(response)) break;
      console.log("");
      console.log("Please enter 'y' for yes, 'n' for no.");
    }
    return response === TwentyOneGame.YES;
  }

  incrementScore(participant) {
    participant.score += 1;
  }

  dealCards() {
    for (
      let cardCount = 1;
      cardCount <= TwentyOneGame.CARDS_DEALT_AT_START;
      cardCount++
    ) {
      this.player.hit(this.deck);
    }

    this.player.updateHandPoints(this.player.calculateHandPoints());

    for (
      let cardCount = 1;
      cardCount <= TwentyOneGame.CARDS_DEALT_AT_START;
      cardCount++
    ) {
      this.dealer.hit(this.deck);
    }

    this.dealer.hand[0].setCardFaceDown();
    this.dealer.updateHandPoints(this.dealer.calculateHandPoints());
  }

  showGameStats() {
    console.log(
      `Dealer's hand: ${this.dealer.getHand()}. Points: ${
        this.dealer.handPoints
      }`
    );
    console.log(
      `Players's hand: ${this.player.getHand()}. Points: ${
        this.player.handPoints
      }`
    );
  }

  hitOrStay() {
    let response;
    while (true) {
      console.log("");
      const prompt =
        "Player must enter 'h' to hit or 's' to stay. Hit or Stay? ";
      response = readline.question(prompt).trim().toLowerCase();

      if ([TwentyOneGame.HIT, TwentyOneGame.STAY].includes(response)) break;
      console.log("Player's input was invalid. Please try again");
    }
    return response;
  }

  playerTurn() {
    this.announcePlayersTurn();
    this.showGameStats();

    while (true && !this.player.isBusted()) {
      let playersAction = this.hitOrStay();

      if (playersAction === TwentyOneGame.STAY) {
        this.player.stay();
        break;
      } else if (playersAction === TwentyOneGame.HIT) {
        console.clear();
        console.log("Player decided to hit.\n");
        this.player.hit(this.deck);
        this.player.updateHandPoints(this.player.calculateHandPoints());
        this.showGameStats();

        if (this.player.isBusted()) {
          console.log("Player busted!");
        }
      }
    }
  }

  announcePlayersTurn() {
    console.log("");
    console.log("Player's turn");
    console.log("");
  }

  dealerTurn() {
    if (!this.player.isBusted()) {
      this.announceDealersTurn();
      this.dealer.revealHiddenCard();
      this.dealer.updateHandPoints(this.dealer.calculateHandPoints());
      this.showGameStats();

      while (this.dealer.handPoints < SEVENTEEN_POINTS) {
        console.log("");
        console.log("Dealer is about to hit");
        this.dealer.hit(this.deck);
        this.dealer.updateHandPoints(this.dealer.calculateHandPoints());
        this.showGameStats();
        if (this.dealer.isBusted()) {
          console.log("Dealer busted!");
        }
      }
    }
  }

  announceDealersTurn() {
    console.log("");
    console.log("Dealer's turn");
    console.log("");
    console.log("Dealer reveals his hidden card...");
  }

  displayWelcomeMessage() {
    console.log("");
    console.log("+------------------------+");
    console.log("| Welcome to GAME of 21! |");
    console.log("+------------------------+");
    console.log("");
  }

  displayGoodbyeMessage() {
    console.log("-------------------------------");
    console.log("Thank you for playing. Goodbye!");
  }

  displayResult() {
    console.log("");

    let winner = this.determineWinner();
    console.log("RESULT OF THIS GAME:");
    if (winner) {
      this.incrementScore(winner);
      console.log(
        `${winner instanceof Dealer ? "Dealer" : "Player"} ` + " won!"
      );
    } else {
      console.log("It's a push (tie)!");
    }
    console.log("");
    console.log("TOTAL GAME SCORE");
    console.log("----------------");
    console.log(`Dealer: ${this.dealer.score}, Player: ${this.player.score}`);
  }

  determineWinner() {
    let dealersHandTotal = this.dealer.handPoints;
    let playersHandTotal = this.player.handPoints;

    let winner = null;
    if (
      this.player.isBusted() ||
      (dealersHandTotal > playersHandTotal && !this.dealer.isBusted())
    ) {
      winner = this.dealer;
      this.player.deductFundsFromPlayersAccount(1);
    } else if (
      this.dealer.isBusted() ||
      (dealersHandTotal < playersHandTotal && !this.player.isBusted())
    ) {
      winner = this.player;
      this.player.addFundsFromPlayersAccount(1);
    }
    return winner;
  }
}

let game = new TwentyOneGame();
game.start();
