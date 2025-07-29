class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.gameActive = false;
        this.playerWins = 0;
        this.dealerWins = 0;
        this.suits = ['♠️', '♥️', '♦️', '♣️'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.dealerRevealed = false;
        
        this.initializeGame();
        this.loadScore();
    }

    initializeGame() {
        // Get DOM elements
        this.elements = {
            newGameBtn: document.getElementById('newGameBtn'),
            hitBtn: document.getElementById('hitBtn'),
            standBtn: document.getElementById('standBtn'),
            resetBtn: document.getElementById('resetBtn'),
            rulesBtn: document.getElementById('rulesBtn'),
            playerCards: document.getElementById('playerCards'),
            dealerCards: document.getElementById('dealerCards'),
            playerValue: document.getElementById('playerValue'),
            dealerValue: document.getElementById('dealerValue'),
            gameStatus: document.getElementById('gameStatus'),
            playerWinsSpan: document.getElementById('playerWins'),
            dealerWinsSpan: document.getElementById('dealerWins'),
            rulesModal: document.getElementById('rulesModal'),
            closeModal: document.querySelector('.close')
        };

        // Add event listeners
        this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.elements.hitBtn.addEventListener('click', () => this.playerHit());
        this.elements.standBtn.addEventListener('click', () => this.playerStand());
        this.elements.resetBtn.addEventListener('click', () => this.resetScore());
        this.elements.rulesBtn.addEventListener('click', () => this.showRules());
        this.elements.closeModal.addEventListener('click', () => this.hideRules());
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.elements.rulesModal) {
                this.hideRules();
            }
        });

        this.updateScoreDisplay();
    }

    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.deck.push({
                    suit: suit,
                    rank: rank,
                    value: this.getCardValue(rank)
                });
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    getCardValue(rank) {
        if (rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(rank)) return 10;
        return parseInt(rank);
    }

    dealCard() {
        return this.deck.pop();
    }

    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;

        for (let card of hand) {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else {
                value += card.value;
            }
        }

        // Adjust for aces
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    createCardElement(card, isHidden = false) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card new-card';
        
        if (isHidden) {
            cardDiv.className += ' hidden';
            cardDiv.innerHTML = `
                <div class="top-left">?</div>
                <div class="center">🂠</div>
                <div class="bottom-right">?</div>
            `;
        } else {
            const isRed = card.suit === '♥️' || card.suit === '♦️';
            if (isRed) cardDiv.className += ' red';
            
            cardDiv.innerHTML = `
                <div class="top-left">${card.rank}${card.suit}</div>
                <div class="center">${card.suit}</div>
                <div class="bottom-right">${card.rank}${card.suit}</div>
            `;
        }

        return cardDiv;
    }

    updateDisplay() {
        // Update player display
        this.elements.playerCards.innerHTML = '';
        for (let card of this.playerHand) {
            this.elements.playerCards.appendChild(this.createCardElement(card));
        }
        this.elements.playerValue.textContent = this.calculateHandValue(this.playerHand);

        // Update dealer display
        this.elements.dealerCards.innerHTML = '';
        for (let i = 0; i < this.dealerHand.length; i++) {
            const isHidden = !this.dealerRevealed && i === 1;
            this.elements.dealerCards.appendChild(this.createCardElement(this.dealerHand[i], isHidden));
        }

        if (this.dealerRevealed) {
            this.elements.dealerValue.textContent = this.calculateHandValue(this.dealerHand);
        } else {
            this.elements.dealerValue.textContent = this.dealerHand.length > 0 ? this.dealerHand[0].value : 0;
        }
    }

    startNewGame() {
        this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameActive = true;
        this.dealerRevealed = false;

        // Enable game buttons
        this.elements.hitBtn.disabled = false;
        this.elements.standBtn.disabled = false;
        this.elements.newGameBtn.textContent = 'New Game';

        // Remove winner/loser classes
        this.elements.playerCards.parentElement.classList.remove('winner', 'loser');
        this.elements.dealerCards.parentElement.classList.remove('winner', 'loser');

        // Deal initial cards
        this.playerHand.push(this.dealCard());
        this.dealerHand.push(this.dealCard());
        this.playerHand.push(this.dealCard());
        this.dealerHand.push(this.dealCard());

        this.updateDisplay();
        this.elements.gameStatus.textContent = 'Game in progress... Hit or Stand?';

        // Check for blackjacks
        const playerBlackjack = this.isBlackjack(this.playerHand);
        const dealerBlackjack = this.isBlackjack(this.dealerHand);

        if (playerBlackjack || dealerBlackjack) {
            this.dealerRevealed = true;
            this.updateDisplay();
            
            if (playerBlackjack && dealerBlackjack) {
                this.endGame('Push! Both have Blackjack!', 'tie');
            } else if (playerBlackjack) {
                this.endGame('Blackjack! You win!', 'player');
            } else {
                this.endGame('Dealer has Blackjack! Dealer wins!', 'dealer');
            }
        }
    }

    isBlackjack(hand) {
        return hand.length === 2 && this.calculateHandValue(hand) === 21;
    }

    playerHit() {
        if (!this.gameActive) return;

        this.playerHand.push(this.dealCard());
        this.updateDisplay();

        const playerValue = this.calculateHandValue(this.playerHand);
        if (playerValue > 21) {
            this.endGame('Bust! You went over 21. Dealer wins!', 'dealer');
        } else if (playerValue === 21) {
            this.playerStand();
        }
    }

    playerStand() {
        if (!this.gameActive) return;

        this.dealerRevealed = true;
        this.dealerPlay();
    }

    dealerPlay() {
        this.updateDisplay();
        
        const dealerPlayStep = () => {
            const dealerValue = this.calculateHandValue(this.dealerHand);
            
            if (dealerValue < 17) {
                this.dealerHand.push(this.dealCard());
                this.updateDisplay();
                setTimeout(dealerPlayStep, 1000); // Delay for dramatic effect
            } else {
                this.determineWinner();
            }
        };

        setTimeout(dealerPlayStep, 500);
    }

    determineWinner() {
        const playerValue = this.calculateHandValue(this.playerHand);
        const dealerValue = this.calculateHandValue(this.dealerHand);

        if (dealerValue > 21) {
            this.endGame('Dealer busts! You win!', 'player');
        } else if (playerValue > dealerValue) {
            this.endGame('You win!', 'player');
        } else if (dealerValue > playerValue) {
            this.endGame('Dealer wins!', 'dealer');
        } else {
            this.endGame('Push! It\'s a tie!', 'tie');
        }
    }

    endGame(message, winner) {
        this.gameActive = false;
        this.elements.hitBtn.disabled = true;
        this.elements.standBtn.disabled = true;
        this.elements.gameStatus.textContent = message;

        if (winner === 'player') {
            this.playerWins++;
            this.elements.playerCards.parentElement.classList.add('winner');
            this.elements.dealerCards.parentElement.classList.add('loser');
        } else if (winner === 'dealer') {
            this.dealerWins++;
            this.elements.dealerCards.parentElement.classList.add('winner');
            this.elements.playerCards.parentElement.classList.add('loser');
        }

        this.updateScoreDisplay();
        this.saveScore();
    }

    updateScoreDisplay() {
        this.elements.playerWinsSpan.textContent = this.playerWins;
        this.elements.dealerWinsSpan.textContent = this.dealerWins;
    }

    resetScore() {
        this.playerWins = 0;
        this.dealerWins = 0;
        this.updateScoreDisplay();
        this.saveScore();
        this.elements.gameStatus.textContent = 'Score reset! Click "New Game" to start!';
    }

    saveScore() {
        localStorage.setItem('blackjackPlayerWins', this.playerWins.toString());
        localStorage.setItem('blackjackDealerWins', this.dealerWins.toString());
    }

    loadScore() {
        const savedPlayerWins = localStorage.getItem('blackjackPlayerWins');
        const savedDealerWins = localStorage.getItem('blackjackDealerWins');
        
        if (savedPlayerWins !== null) {
            this.playerWins = parseInt(savedPlayerWins);
        }
        if (savedDealerWins !== null) {
            this.dealerWins = parseInt(savedDealerWins);
        }
        
        this.updateScoreDisplay();
    }

    showRules() {
        this.elements.rulesModal.style.display = 'block';
    }

    hideRules() {
        this.elements.rulesModal.style.display = 'none';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BlackjackGame();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        document.getElementById('newGameBtn').click();
    } else if (event.code === 'KeyH') {
        document.getElementById('hitBtn').click();
    } else if (event.code === 'KeyS') {
        document.getElementById('standBtn').click();
    }
});
