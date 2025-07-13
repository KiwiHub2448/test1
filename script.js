let playerName = '';
let isModalOpen = false;
let secretNumber;
const collectedHints = new Set();

let problem1Solved = false;
let problem2Solved = false;
let gameSolved = false;
let posterChecked = false;
let gameCleared = false;

function openModal(content, showClose = true) {
  if (isModalOpen) return;
  const modal = document.getElementById('modal');
  modal.innerHTML = content;
  if (showClose) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    closeBtn.onclick = closeModal;
    modal.appendChild(closeBtn);
  }
  modal.classList.remove('hidden');
  isModalOpen = true;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').innerHTML = '';
  isModalOpen = false;
}

function showMessage(text, duration = 4000) {
  const msg = document.getElementById('message-modal');
  msg.textContent = text;
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), duration);
}

function askName() {
  if (playerName) return;
  openModal(`
    <p>게임을 시작하려면 이름을 입력하세요.</p>
    <div class="name-input-container">
      <input type="text" id="name-input" />
      <button id="start-btn" disabled>시작</button>
    </div>
  `, false);

  setTimeout(() => {
    const input = document.getElementById('name-input');
    const btn = document.getElementById('start-btn');
    if (!input || !btn) return;

    input.addEventListener('input', () => {
      btn.disabled = input.value.trim() === '';
    });

    btn.addEventListener('click', () => {
      const name = input.value.trim();
      if (name) {
        playerName = name;
        closeModal();
      }
    });
  }, 0);
}

function addHint(hint) {
  if (!collectedHints.has(hint)) {
    collectedHints.add(hint);
    showMessage(`힌트를 얻었습니다: ${hint}`, 3000);
  }
}

function showAllHints() {
  if (isModalOpen) return;
  const list = Array.from(collectedHints).map(h => `<li>${h}</li>`).join('');
  openModal(`<h3>📌 수집한 숫자</h3>${list || "<p>아직 없음</p>"}`);
}

function showProblem1() {
  if (problem1Solved) {
    openModal(`<p>이미 풀었습니다. 힌트는 8입니다.</p>`);
    return;
  }

  openModal(`
    <p>문제 1: 이 프로그램의 결과값은?</p>
    <pre>
숫자 = 10
만약 숫자 > 5 이면:
  숫자 = 숫자 + 3
그렇지 않으면:
  숫자 = 숫자 - 2
결과값 = 숫자 * 2
    </pre>
    <button onclick="checkAnswer1(20)">20</button>
    <button onclick="checkAnswer1(26)">26</button>
    <button onclick="checkAnswer1(16)">16</button>
    <button onclick="checkAnswer1(18)">18</button>
  `);
}

function checkAnswer1(ans) {
  if (ans === 16) {
    closeModal();
    problem1Solved = true;
    addHint("8");
  } else {
    showMessage("오답입니다.");
  }
}

function showProblem2() {
  if (problem2Solved) {
    openModal(`<p>이미 풀었습니다. 힌트는 1입니다.</p>`);
    return;
  }

  openModal(`
    <p>문제 2: 내가 만든 프로그램을 실행시켰는데, 오류가 계속 생긴다. 가장 효율적인 해결 방법은?</p>
    <button onclick="checkAnswer2(1)">프로그램 삭제</button>
    <button onclick="checkAnswer2(2)">오류 메시지 확인</button>
    <button onclick="checkAnswer2(3)">바이러스 검사</button>
    <button onclick="checkAnswer2(4)">기다린다</button>
  `);
}

function checkAnswer2(choice) {
  if (choice === 2) {
    closeModal();
    problem2Solved = true;
    addHint("1");
  } else {
    showMessage("오답입니다.");
  }
}

function startGame() {
  if (gameSolved) {
    openModal(`<p>이미 플레이하셨습니다. 힌트는 9입니다.</p>`);
    return;
  }

  secretNumber = Math.floor(Math.random() * 100) + 1;

  let current = 50;
  openModal(`
    <p>숫자 맞추기 게임<br>1부터 100 사이의 숫자를 맞춰보세요.</p>
    <input type="number" id="guess-input" value="${current}" min="1" max="100" step="1" />
    <div class="keypad-grid">
      <button class="keypad-btn" id="down-btn">▼</button>
      <button class="keypad-btn" onclick="checkGuess()">확인</button>
      <button class="keypad-btn" id="up-btn">▲</button>
    </div>
  `);

  let holdTimeout = null;
  let holdInterval = null;

  window.changeGuess = function (delta) {
    const input = document.getElementById('guess-input');
    let val = parseFloat(input.value);
    if (isNaN(val)) val = 1;
    val = Math.round(val + delta);
    val = Math.min(100, Math.max(1, val));
    input.value = val;
  };

  function setupHold(button, delta) {
    button.addEventListener("mousedown", () => {
      changeGuess(delta);
      holdTimeout = setTimeout(() => {
        holdInterval = setInterval(() => changeGuess(delta), 100);
      }, 1000);
    });
    button.addEventListener("mouseup", () => {
      clearTimeout(holdTimeout);
      clearInterval(holdInterval);
    });
    button.addEventListener("mouseleave", () => {
      clearTimeout(holdTimeout);
      clearInterval(holdInterval);
    });
  }

  setTimeout(() => {
    setupHold(document.getElementById('up-btn'), 1);
    setupHold(document.getElementById('down-btn'), -1);
  }, 0);

  window.checkGuess = function () {
    let val = parseFloat(document.getElementById('guess-input').value);
    val = Math.round(val);

    if (isNaN(val) || val < 1 || val > 100) {
      showMessage("1~100 사이의 숫자를 입력하세요");
      return;
    }

    if (val === secretNumber) {
      closeModal();
      gameSolved = true;
      addHint("9");
    } else {
      showMessage(val < secretNumber ? "업!" : "다운!");
    }
  };
}

function showPoster() {
  if (posterChecked) {
    openModal(`<p>힌트는 7입니다. 잘 탈출해보세요. 화이팅!</p>`);
    return;
  }
  posterChecked = true;
  openModal(`<p>힌트는 7입니다. 잘 탈출해보세요. 화이팅!</p>`);
  addHint("7");
}

function showClearScreen() {
  openModal(`
    <h2>🎉 탈출 성공!</h2>
    <p>${playerName}님, 방탈출에 성공하셨습니다!</p>
    <button onclick="restartGame()">다시 시작하기</button>
  `);
  gameCleared = true;
}

function restartGame() {
  playerName = '';
  isModalOpen = false;
  secretNumber = undefined;
  collectedHints.clear();
  problem1Solved = false;
  problem2Solved = false;
  gameSolved = false;
  posterChecked = false;
  gameCleared = false;
  document.getElementById("door").classList.remove("door-open");
  closeModal();
  askName();
}

function showPasswordPad() {
  let input = "";
  openModal(`
    <p>비밀번호를 입력하세요</p>
    <p class="password-hint">🔐 힌트: 아인슈타인이 태어난 연도</p>
    <div class="password-display" id="pw-display">____</div>
    <div class="keypad-grid">
      ${[1,2,3,4,5,6,7,8,9,'확인',0,'지우기'].map(val => `
        <button class="keypad-btn" onclick="handleKeypad('${val}')">${val}</button>
      `).join('')}
    </div>
  `);

  window.handleKeypad = function(val) {
    if (val === '지우기') {
      input = input.slice(0, -1);
    } else if (val === '확인') {
      if (input === '1879') {
        closeModal();
        showMessage("문이 열렸습니다!");
        document.getElementById("door").classList.add("door-open");
        setTimeout(showClearScreen, 1000);
        return;
      } else {
        showMessage("비밀번호가 틀렸습니다.");
      }
    } else {
      if (input.length < 4) input += val;
    }
    document.getElementById('pw-display').textContent = input.padEnd(4, '_');
  };
}

document.addEventListener('DOMContentLoaded', () => {
  askName();

  document.getElementById('laptop').onclick = () => {
    if (isModalOpen || !playerName || gameCleared) return;
    showProblem1();
  };
  document.getElementById('clock').onclick = () => {
    if (isModalOpen || !playerName || gameCleared) return;
    showProblem2();
  };
  document.getElementById('memo').onclick = () => {
    if (isModalOpen || !playerName || gameCleared) return;
    startGame();
  };
  document.getElementById('poster').onclick = () => {
    if (isModalOpen || !playerName || gameCleared) return;
    showPoster();
  };
  document.getElementById('door').onclick = () => {
    if (isModalOpen || !playerName || gameCleared) return;
    showPasswordPad();
  };

  document.getElementById('hint-button').onclick = () => {
    if (!playerName || gameCleared) return;
    showAllHints();
  };
});
