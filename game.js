// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let mode        = '';     // 'ai' | '2p'
let board       = [];     // 0=empty, -1=X, 1=O
let currentP    = -1;     // whose turn: -1=X, 1=O
let gameOver    = false;
let playerOrder = 1;      // 1=player first, 2=AI first (AI mode only)
let scores      = { x: 0, o: 0 };

const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectMode(m) {
  mode = m;
  const isAI = (m === 'ai');
  document.getElementById('name2-label').textContent        = isAI ? 'AI Name (O)' : 'Player 2 Name (O)';
  document.getElementById('name2').value                    = isAI ? 'HAL-9000' : '';
  document.getElementById('name2').readOnly                 = isAI;
  document.getElementById('order-group').style.display      = isAI ? 'flex' : 'none';
  showScreen('screen-setup');
}

function selectOrder(o) {
  playerOrder = o;
  document.getElementById('order-first').classList.toggle('selected',  o === 1);
  document.getElementById('order-second').classList.toggle('selected', o === 2);
}

function goBack() { showScreen('screen-mode'); }
function goMenu() { scores = { x: 0, o: 0 }; showScreen('screen-mode'); }

// ─────────────────────────────────────────────
//  GAME INIT
// ─────────────────────────────────────────────
function startGame() {
  const n1 = document.getElementById('name1').value.trim() || 'Player 1';
  const n2 = document.getElementById('name2').value.trim() || (mode === 'ai' ? 'HAL-9000' : 'Player 2');
  document.getElementById('name-x').textContent  = n1;
  document.getElementById('name-o').textContent  = n2;
  document.getElementById('score-x').textContent = scores.x;
  document.getElementById('score-o').textContent = scores.o;
  showScreen('screen-game');
  resetBoard();
}

function resetBoard() {
  board    = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  gameOver = false;
  currentP = -1; // X always starts internally

  renderBoard();
  setStatus('');
  updateActiveCard();

  // If AI mode and AI goes first
  if (mode === 'ai' && playerOrder === 2) {
    setTimeout(doAITurn, 400);
  }
}

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
function renderBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.innerHTML = '';
    cell.classList.remove('taken', 'win-cell');
    if (board[i] === -1) {
      cell.innerHTML = '<span class="mark x">X</span>';
      cell.classList.add('taken');
    } else if (board[i] === 1) {
      cell.innerHTML = '<span class="mark o">O</span>';
      cell.classList.add('taken');
    }
  });
}

function renderCell(idx) {
  const cell = document.querySelector(`.cell[data-idx="${idx}"]`);
  cell.classList.add('taken');
  if (board[idx] === -1) cell.innerHTML = '<span class="mark x">X</span>';
  if (board[idx] ===  1) cell.innerHTML = '<span class="mark o">O</span>';
}

function setStatus(msg, type = '') {
  const bar     = document.getElementById('status-bar');
  bar.textContent = msg;
  bar.className   = 'status-bar ' + type;
}

function updateActiveCard() {
  document.getElementById('card-x').classList.toggle('active-player', currentP === -1 && !gameOver);
  document.getElementById('card-o').classList.toggle('active-player', currentP ===  1 && !gameOver);
}

function setThinking(v) {
  document.getElementById('thinking-indicator').classList.toggle('visible', v);
}

// ─────────────────────────────────────────────
//  GAME LOGIC  (ported 1:1 from Python)
// ─────────────────────────────────────────────

/* analyseBoard — returns winning player value or 0 */
function analyseBoard(b) {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] !== 0 && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return 0;
}

/* minmax — same recursive algorithm as Python */
function minmax(b, player) {
  const x = analyseBoard(b);
  if (x !== 0) return x * player;
  let value = -2;
  let pos   = -1;
  for (let i = 0; i < 9; i++) {
    if (b[i] === 0) {
      b[i] = player;
      const score = -minmax(b, player * -1);
      b[i] = 0; // backtrack
      if (score > value) { value = score; pos = i; }
    }
  }
  if (pos === -1) return 0;
  return value;
}

/* compBestMove — mirrors compTurn(), picks best cell for O (value=1) */
function compBestMove(b) {
  let pos   = -1;
  let value = -2;
  for (let i = 0; i < 9; i++) {
    if (b[i] === 0) {
      b[i] = 1;
      const score = -minmax(b, -1); // -1 = next turn is player's
      b[i] = 0; // backtrack
      if (score > value) { value = score; pos = i; }
    }
  }
  return pos;
}

// ─────────────────────────────────────────────
//  CELL CLICK
// ─────────────────────────────────────────────
function cellClick(idx) {
  if (gameOver || board[idx] !== 0) return;
  // In AI mode, only accept input when it's the player's turn (X = -1)
  if (mode === 'ai' && currentP !== -1) return;

  board[idx] = currentP;
  renderCell(idx);
  checkEndTurn();
}

function checkEndTurn() {
  const result = analyseBoard(board);
  if (result !== 0) { endGame(result); return; }
  if (board.every(v => v !== 0)) { endGame(0); return; }

  currentP *= -1;
  updateActiveCard();
  setStatus(turnLabel());

  if (mode === 'ai' && currentP === 1) {
    setTimeout(doAITurn, 350);
  }
}

function doAITurn() {
  if (gameOver) return;
  setThinking(true);
  setTimeout(() => {
    const pos = compBestMove(board);
    if (pos !== -1) {
      board[pos] = 1;
      renderCell(pos);
    }
    setThinking(false);
    checkEndTurn();
  }, 300);
}

function turnLabel() {
  const nameX = document.getElementById('name-x').textContent;
  const nameO = document.getElementById('name-o').textContent;
  return currentP === -1
    ? `${nameX}'s turn (X)`
    : `${nameO}'s turn (O)`;
}

// ─────────────────────────────────────────────
//  END STATE
// ─────────────────────────────────────────────
function endGame(result) {
  gameOver = true;
  updateActiveCard();

  if (result !== 0) {
    highlightWin(result);
    const winnerName = result === -1
      ? document.getElementById('name-x').textContent
      : document.getElementById('name-o').textContent;
    const sym = result === -1 ? 'X' : 'O';
    setStatus(`${winnerName} wins! (${sym})`, 'winner');
    if (result === -1) { scores.x++; document.getElementById('score-x').textContent = scores.x; }
    else               { scores.o++; document.getElementById('score-o').textContent = scores.o; }
  } else {
    setStatus("It's a draw!", 'draw');
  }
}

function highlightWin(player) {
  for (const line of WIN_LINES) {
    if (line.every(i => board[i] === player)) {
      line.forEach(i => {
        document.querySelector(`.cell[data-idx="${i}"]`).classList.add('win-cell');
      });
      return;
    }
  }
}

/*
  Board value convention (matches original Python):
    0  = empty
   -1  = X  (human player)
    1  = O  (computer / player 2)
  Win result -1 → X wins, 1 → O wins, 0 → draw
*/
