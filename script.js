// 生成一副扑克牌
function generateDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const deck = [];

    for (const suit of suits) {
        for (const value of values) {
            deck.push(value + suit);
        }
    }
    return deck;
}

// 洗牌
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// 初始化游戏
function startGame() {
    const deck = shuffleDeck(generateDeck());
    const userHand = deck.slice(0, 5); // 用户手牌
    const aiHand = deck.slice(5, 10); // AI 手牌
    const playedCard = deck[10]; // 底牌（或第一次出牌）

    // 显示玩家手牌
    displayHand(userHand, 'user-player');
    displayHand(aiHand, 'ai-player');

    // 显示当前出牌
    document.getElementById('played-card').innerText = playedCard;
    updateGameInfo('等待玩家出牌...');
}

// 显示玩家手牌
function displayHand(hand, playerId) {
    const playerHand = document.getElementById(playerId);
    playerHand.innerHTML = '';
    hand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.innerText = card;
        playerHand.appendChild(cardElement);
    });
}

// 更新游戏信息
function updateGameInfo(message) {
    document.getElementById('game-info').innerText = message;
}

// 游戏开始
startGame();

// 绑定出牌按钮事件
document.getElementById('play-button').addEventListener('click', () => {
    const userHand = document.querySelectorAll('#user-player .card');
    if (userHand.length > 0) {
        const playedCard = userHand[0]; // 模拟出牌（这里只是选取第一张卡牌）
        document.getElementById('played-card').innerText = playedCard.innerText;
        userHand[0].remove();
        updateGameInfo('玩家已出牌，等待 AI 出牌...');
        
        // 模拟 AI 出牌
        setTimeout(() => {
            aiPlay();
        }, 1000);
    }
});

// AI 出牌
function aiPlay() {
    const aiHand = document.querySelectorAll('#ai-player .card');
    if (aiHand.length > 0) {
        const aiCard = aiHand[0];
        document.getElementById('played-card').innerText = aiCard.innerText;
        aiCard.remove();
        updateGameInfo('AI 已出牌，等待玩家出牌...');
    }
}
