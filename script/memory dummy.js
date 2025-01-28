document.addEventListener('DOMContentLoaded', () => {
    const selectors = {
        boardContainer: document.querySelector('.board-container'),
        board: document.querySelector('.board'),
        moves: document.querySelector('.moves'),
        timer: document.querySelector('.timer'),
        start: document.querySelector('.button'),
        win: document.querySelector('.win'),
    };

    const state = {
        gameStarted: false,
        flippedCards: 0,
        totalFlips: 0,
        totalTime: 0,
        loop: null,
        isProcessing: false,
    };

    const shuffle = array => {
        const cloneArray = [...array];
        for (let i = cloneArray.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [cloneArray[i], cloneArray[randomIndex]] = [cloneArray[randomIndex], cloneArray[i]];
        }
        return cloneArray;
    };

    const pickRandom = (array, items) => {
        const cloneArray = [...array];
        const result = [];
        for (let i = 0; i < items; i++) {
            const randomIndex = Math.floor(Math.random() * cloneArray.length);
            result.push(cloneArray[randomIndex]);
            cloneArray.splice(randomIndex, 1);
        }
        return result;
    };

    const generateGame = () => {
        const dimensions = parseInt(selectors.board.getAttribute('data-dimension'), 10);
        if (dimensions % 2 !== 0) {
            throw new Error("The dimension of the board must be an even number.");
        }

        const emojis = ['🍉', '🍌', '🍒', '🍊', '🍇', '🍓', '🍑', '🍍', '🥝', '🍏', '🍋', '🥭', '🍈', '🍐', '🍎', '🍅', '🥒', '🥔', '🥕', '🌽', '🥑'];
        const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
        const items = shuffle([...picks, ...picks]);

    
        const cards = `
            <div class="board" data-dimension="4" style="grid-template-columns: repeat(${dimensions}, auto)">
                ${items.map(item => `
                    <div id=` + Math.random() + ` class="card">
                        <div class="card-front"></div>
                        <div class="card-back">${item}</div>
                    </div>
                `).join('')}
            </div>
        `;

        const parser = new DOMParser().parseFromString(cards, 'text/html');
        selectors.board.replaceWith(parser.querySelector('.board'));
        selectors.board = document.querySelector('.board'); // Update the reference
    };

    const startGame = () => {
        state.gameStarted = true;
        selectors.start.classList.add('disabled');

        state.loop = setInterval(() => {
            state.totalTime++;
            selectors.moves.innerText = `${state.totalFlips} moves`;
            selectors.timer.innerText = `${state.totalTime} sec`;
        }, 1000);
    };

    const flipBackCards = () => {
        document.querySelectorAll('.card:not(.matched)').forEach(card => {
            card.classList.remove('flipped');
        });
        state.flippedCards = 0;  // TODO: What is this? 
    };

    const checkMatch = () => {
        const flipped = document.querySelectorAll('.card.flipped:not(.matched)');
        const [firstCard, secondCard] = flipped;
        console.log(firstCard.id, secondCard.id, flipped );

        if (firstCard.innerText == secondCard.innerText && firstCard.id !== secondCard.id) {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            state.flippedCards = 0;
            state.isProcessing = false;
        } else {
            // TODO: This is a hacky way to flip back the cards? Refactor this
            setTimeout(() => {
                flipped.forEach(card => card.classList.remove('flipped'));
                state.flippedCards = 0;
                state.isProcessing = false;
            }, 1000);
           
        }

    };

    const flipCard = card => {
        console.log('(BEFORE) Amount of cards flipped: ' + state.flippedCards);
        if (state.flippedCards < 2) return;
        if (state.isProcessing || card.classList.contains('flipped')) return;
        console.log(card.id)
        card.classList.add('flipped');
        state.flippedCards++;
        console.log('(AFTER) Amount of cards flipped: ' + state.flippedCards);
        state.totalFlips++; 

        if (!state.gameStarted) {
            startGame();
        }

        if (state.flippedCards == 2) {
           
            state.isProcessing = false;
          
         setTimeout(() => {
           
            state.flippedCards = 0;
            state.isProcessing = false;
            checkMatch();
        }, 0);
        }

        if (!document.querySelectorAll('.card:not(.flipped)').length) {
            setTimeout(() => {
                selectors.boardContainer.classList.add('flipped');
                selectors.win.innerHTML = `
                    <span class="win-text">
                        You won!<br />
                        With <span class="highlight">${state.totalFlips}</span> moves<br />
                        Under <span class="highlight">${state.totalTime}</span> seconds
                    </span>
                `;

                clearInterval(state.loop);
            }, 1000);
        }
    };

 

    const attachEventListeners = () => {
        document.addEventListener('click', event => {
           
            console.log('Clicked');
            const eventTarget = event.target;
            const eventParent = eventTarget.parentElement;
  
            if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped') && !state.isProcessing) {
                flipCard(eventParent);
                // eventTarget.removeEventListener('click', attachEventListeners);
            } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
                startGame();
            }
      
        } 

        );
};

    

    generateGame();
    attachEventListeners();
});



