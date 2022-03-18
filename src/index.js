let playerCash = 1000;

let currentBet;

let insuranceBet;

let isInsuranceWon;

class Player {
    constructor(hand, score, isBusted, isBlackjack) {
        this.hand = hand;
        this.score = score;
        this.isBusted = isBusted;
        this.isBlackjack = isBlackjack;
    }
}

let humanPlayer = new Player([], 0, false, false);
let dealer = new Player([], 0, false, false);


function deal() {

    currentBet = Number($('#next-bet-input').val());

    if (!checkValidBet(currentBet)) {
        return;
    }
    $('#current-bet').html(`${currentBet} €`);
    document.getElementById("deal").disabled = true;
    restart();

    for (let i = 1; i <= 4; i++) {
        i % 2 != 0 ? pushCardTo(humanPlayer.hand, true, i) : pushCardTo(dealer.hand, false, i);
    }

    setTimeout(() => {
        humanPlayer.score = updatePlayerScore();
        dealer.score = updateDealerScore();
        document.getElementById("double-down").disabled = false;
        document.getElementById("hit").disabled = false;
        document.getElementById("stand").disabled = false;

        if (dealer.score === 11) {
            offerInsurance();
        } else if (humanPlayer.score === 21 || dealer.score === 10) {
            checkForBlackjack();
        }
    }, 2100);
}

function restart() {

    deck = ['AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS'];
    // deck = ['AH', 'KH', 'AS', 'KS', 'AC', 'KC', 'QH', 'QC', 'AD'];
    //deck = ['AH', '2H', '3H', 'AS', '2S', '3S', '4S', 'AC', '2C', '3C', 'AD', '2D', '3D', '4D']

    $('#player-hand').css('min-width', `${$('#player-hand').width()}px`);
    $('#dealer-hand').css('min-width', `${$('#dealer-hand').width()}px`);

    $('.hand').html('');
    $('.score-text').html('');

    $('.invisible').removeClass('visible');

    setTimeout(() => {
        $('#player-hand').css('min-width', '');
        $('#dealer-hand').css('min-width', '');
    }, 1000);

    insuranceBet = 0;
    isInsuranceWon = false;

    humanPlayer.hand = [];
    humanPlayer.score = 0;
    humanPlayer.isBusted = false;
    humanPlayer.isBlackjack = false;

    dealer.hand = [];
    dealer.score = 0;
    dealer.isBusted = false;
    dealer.isBlackjack = false;
}

function pushCardTo(hand, isPlayer, i = 2) {

    let nextCardIndex = Math.floor(Math.random() * deck.length);
    let nextCard = deck.splice(nextCardIndex, 1)[0];
    let cardIdSuffix = nextCard;

    if (isPlayer) {
        hand.push(nextCard);
        $('#player-hand').append(`<img class="card invisible" style="z-index: ${hand.length}" id="card-${cardIdSuffix}" src="../resources/cards/${nextCard}.png" />`);

    } else {
        hand.push(nextCard);

        if (nextCard === hand[1]) {
            cardIdSuffix = 'flipped';

            $('#dealer-hand').append(`
                <div class="card-flipped-container card" style="z-index: ${hand.length}">
                    <img class="card-flipped-front invisible" src="../resources/cards/${nextCard}.png" />
                    <img class="card-flipped-back invisible" id="card-${cardIdSuffix}" src="../resources/cards/purple_back.png"/>
                </div>
            `);

        } else {
            $('#dealer-hand').append(`<img class="card invisible" style="z-index: ${hand.length}" id="card-${cardIdSuffix}" src="../resources/cards/${nextCard}.png" />`);
        }
    }
    setTimeout(() => {
        $(`#card-${cardIdSuffix}`).addClass('card-move-animation');
    }, 300 * i);
}

function updateDealerScore(isDealerCardVisible, isDelayed, i = 0) {
    let score = 0;

    if (isDealerCardVisible) {
        score = calculateHandValue(dealer.hand);
    } else {
        score = calculateHandValue([dealer.hand[0]]);
    }

    if (isDelayed) {
        setTimeout(() => {
            $('#dealer-score').html(score);
        }, 400 + 400 * i);
    } else {
        $('#dealer-score').html(score);
    }

    return score;
}

function updatePlayerScore() {
    let score = calculateHandValue(humanPlayer.hand);
    $('#player-score').html(score);
    return score;
}

function calculateHandValue(hand) {

    let numAces = hand.filter(card => {
        let cardValue = card.slice(0, card.length - 1);
        return cardValue === 'A';
    }).length;

    let handValue = hand.reduce((acc, val) => {
        let cardValue = val.slice(0, val.length - 1);

        if (cardValue === 'J' || cardValue === 'Q' || cardValue === 'K') cardValue = 10;
        else if (cardValue === 'A') cardValue = 11;
        else cardValue = Number(cardValue);

        return acc + cardValue;
    }, 0);

    while (handValue > 21 && numAces > 0) {
        handValue -= 10;
        numAces --;
    }

    return handValue;
}

function hit() {

    document.getElementById("hit").disabled = true;
    document.getElementById("stand").disabled = true;
    document.getElementById("double-down").disabled = true;

    pushCardTo(humanPlayer.hand, true, 1);

    setTimeout(() => {
        humanPlayer.score = updatePlayerScore();
        if (humanPlayer.score > 21) {
            bustedPlayer();
        } else if (humanPlayer.score < 21) {
            document.getElementById("hit").disabled = false;
            document.getElementById("stand").disabled = false;
        } else {
            document.getElementById("stand").disabled = false;
        }
    }, 1100);
}

function dealerTurn() {

    flipCard();
    let i = 1;

    while (dealer.score < 17) {
        dealer.score = hitDealer(i);
        i++;
    }
    if (dealer.score > 21) {
        bustedDealer(i);
    } else {
        endRound(i);
    }
}

function hitDealer(i) {
    pushCardTo(dealer.hand, false, i);
    return updateDealerScore(true, true, i);
}

function bustedPlayer() {

    notifyStatus('player', 'bust');
    humanPlayer.isBusted = true;
    endRound();
}

function bustedDealer(i) {
    setTimeout(() => {
        notifyStatus('dealer', 'bust');
    }, 400 * i);
    dealer.isBusted = true;
    endRound(i);
}

function endRound(i = 0) {

    document.getElementById("hit").disabled = true;
    document.getElementById("stand").disabled = true;
    document.getElementById("double-down").disabled = true;

    const playerCashBeforeSettling = playerCash;

    let resultPositivity = '';

    setTimeout(() => {

        document.getElementById("deal").disabled = false;

        if (!humanPlayer.isBlackjack && !dealer.isBlackjack) {

            if (dealer.isBusted || (humanPlayer.score > dealer.score && !humanPlayer.isBusted)) {
                $('.result-text').html('You win!');
                playerCash += currentBet;
                resultPositivity = 'positive';
            } else if (humanPlayer.isBusted || dealer.score > humanPlayer.score){
                $('.result-text').html('Dealer wins!');
                playerCash -= currentBet;
                resultPositivity = 'negative';
            } else {
                $('.result-text').html('Stand-off! Your bet is returned.');
                resultPositivity = 'neutral';
            }

        } else if (humanPlayer.isBlackjack && !dealer.isBlackjack) {
            $('.result-text').html('You win with blackjack! Your bet pays 1.5x more.');
            playerCash += currentBet * 1.5;
            resultPositivity = 'positive';
        } else if (!humanPlayer.isBlackjack && dealer.isBlackjack) {
            playerCash -= currentBet;
            $('.result-text').html('Dealer wins with blackjack!');
            resultPositivity = 'negative';
        } else if (humanPlayer.isBlackjack && dealer.isBlackjack) {
            $('.result-text').html('Stand-off! Your bet is returned.');
            resultPositivity = 'neutral';
        }
        animateCash(playerCashBeforeSettling, playerCash);
        animateResult(resultPositivity);
    }, 600 + 400 * i);
}

function checkForBlackjack() {

        if (calculateHandValue(dealer.hand) === 21) {
            dealer.isBlackjack = true;
            flipCard();
            setTimeout(() => {
                notifyStatus('dealer', 'blackjack');
            }, 400);
        }
        if (humanPlayer.score === 21) {
            humanPlayer.isBlackjack = true;
            notifyStatus('player', 'blackjack');
        }
        if (dealer.isBlackjack || humanPlayer.isBlackjack) {
            endRound();
        }
}

function doubleDown() {

    currentBet *= 2;
    $('#current-bet').html(`${currentBet} €`);
    hit(true);

    setTimeout(() => {
        if (humanPlayer.score <= 21) {
            dealerTurn();
        }
    }, 1100);

}

function flipCard() {
    $('.card-flipped-front').css('opacity', '1');
    $('.card-flipped-container').addClass('card-flip-animation');
    dealer.score = updateDealerScore(true, true);
}

function offerInsurance() {

    enableModal('Do you wish to take an insurance bet?', 'insurance');

    $('#cancel-button').click(function(event) {
        disableModal();
        checkForBlackjack();
        event.stopImmediatePropagation();
    });

    $('#accept-button').click(function(event){
        insuranceBet = currentBet / 2;
        const playerCashBeforeSettling = playerCash;
        disableModal();

        $('#insurance-box').removeClass('positive-color');
        $('#insurance-box').removeClass('negative-color');

        checkForBlackjack();

        if (dealer.isBlackjack) {
            playerCash += insuranceBet * 2;
            $('.insurance-text').html(`You won the insurance bet`);
            $('#insurance-box').addClass('positive-color');
            setTimeout(() => {
                $('#insurance-box').addClass('visible');
            }, 300);
        } else {
            playerCash -= insuranceBet * 2;
            $('.insurance-text').html(`You lost the insurance bet`);
            $('#insurance-box').addClass('negative-color');
            $('#insurance-box').addClass('visible');
        }
        if (!dealer.isBlackjack && !humanPlayer.isBlackjack) {
            animateCash(playerCashBeforeSettling, playerCash);
        }
        event.stopImmediatePropagation();
    });
}

function enableModal(modalText, whichButtons) {
    if (whichButtons === 'insurance') {
        $('#cancel-button').css('display', 'block');
        $('#accept-button').css('display', 'block');
    }
    if (whichButtons === 'alert') {
        $('#ok-button').css('display', 'block');
    }
    $('.modal-text').html(modalText);
    $('.modal').addClass('modal-fade-in-animation');
    $('.modal-box').addClass('modal-box-grow-animation');
    $('.modal-button-container').addClass('modal-button-fade-in-animation');
}

function disableModal() {
    $('.modal').removeClass('modal-fade-in-animation');
    $('.modal-box').removeClass('modal-box-grow-animation');
    $('.modal-button-container').removeClass('modal-button-fade-in-animation');
    $('.modal-button').css('display', 'none');
}

function animateCash(cashBeforeSettling, cashAfterSettling) {

    $('.money-popup-animation').removeClass('money-popup-animation');
    $('#current-money').html(`${playerCash} €`);

    setTimeout(() => {
        if (cashAfterSettling >= cashBeforeSettling) {
            $('.money-popup-positive').html(`+${cashAfterSettling - cashBeforeSettling} €`)
            $('.money-popup-positive').addClass('money-popup-animation');
        } else if (cashAfterSettling < cashBeforeSettling) {
            $('.money-popup-negative').html(`${cashAfterSettling - cashBeforeSettling} €`)
            $('.money-popup-negative').addClass('money-popup-animation');
        }
    }, 100);

}

function notifyStatus(whichPlayer, currentStatus) {


    if (whichPlayer === 'player') {
        $('#player-status-box').removeClass('blackjack-color');
        $('#player-status-box').removeClass('negative-color');
        if (currentStatus === 'blackjack') {
            $('#player-status-text').html('Blackjack');
            $('#player-status-box').addClass('blackjack-color');
            $('#player-score-highlight-blackjack').addClass('visible');
        } else if (currentStatus === 'bust') {
            $('#player-status-text').html('Bust');
            $('#player-status-box').addClass('negative-color');
            $('#player-score-highlight-bust').addClass('visible');
        }
        $('#player-status-box').addClass('visible');

    } else if (whichPlayer === 'dealer') {
        $('#dealer-status-box').removeClass('blackjack-color');
        $('#dealer-status-box').removeClass('negative-color');
        if (currentStatus === 'blackjack') {
            $('#dealer-status-text').html('Blackjack');
            $('#dealer-status-box').addClass('blackjack-color');
            $('#dealer-score-highlight-blackjack').addClass('visible');
        } else if (currentStatus === 'bust') {
            $('#dealer-status-text').html('Bust');
            $('#dealer-status-box').addClass('negative-color');
            $('#dealer-score-highlight-bust').addClass('visible');
        }
        $('#dealer-status-box').addClass('visible');
    }
}

function animateResult(resultPositivity) {

    $('.result-box').removeClass('neutral-color');
    $('.result-box').removeClass('positive-color');
    $('.result-box').removeClass('negative-color');

    if (resultPositivity === 'neutral') {
        $('.result-box').addClass('neutral-color');

    } else if (resultPositivity === 'positive') {
        $('.result-box').addClass('positive-color');

    } else if (resultPositivity === 'negative') {
        $('.result-box').addClass('negative-color');
    }
    $('.result-box').addClass('visible');
}

function checkValidBet(currentBet) {

    if (!currentBet) {
        enableModal('Please place a bet', 'alert');
    } else if (currentBet <= 0) {
        enableModal('Your bet cannot be a negative number', 'alert');
    } else if (currentBet > 500) {
        enableModal('Maximum bet allowed is 500 €', 'alert');
    } else if (currentBet - Math.floor(currentBet) != 0) {
        enableModal('Your bet must be a round number', 'alert');
    } else {
        return true;
    }
    return false;
}