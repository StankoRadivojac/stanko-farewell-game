const app = {
  introLines: [
    "Zdar, co zas potřebuješ?",
    "Nazdar. Co se rozbilo tentokrát?",
    "Čau, povídej.",
    "Tak co je zase potřeba?",
    "Co máš?",
    "Zdar. Tak mě překvap.",
    "Co hoří?",
    "Povídej, jsem zvědavý."
  ],
  colleagueCountKey: "stanko_colleague_count",
  initialColleagueCount: 39,
  timerSeconds: 5 * 60,
  bahamaDelayMs: 15 * 1000,
  timerId: null,
  speedTimerId: null
};

const $ = (id) => document.getElementById(id);

function getColleagueCount() {
  const stored = Number(localStorage.getItem(app.colleagueCountKey));
  return Number.isFinite(stored) && stored >= app.initialColleagueCount ? stored : app.initialColleagueCount;
}

function setColleagueCount(value) {
  localStorage.setItem(app.colleagueCountKey, String(value));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function setSceneVariant(variant = "") {
  const scene = document.querySelector(".scene");
  if (!scene) return;
  scene.classList.remove("scene-home-compact", "scene-printer-detailed-compact");
  if (variant) scene.classList.add(variant);
}

function setCharacterImage(filename) {
  const image = $("characterImage");
  if (image) image.src = `assets/${filename}`;
}

function setDialog(text, speaker = "Stanko:") {
  $("dialogText").innerHTML = text ? `„${text}“` : "";
  $("dialogText").previousElementSibling.textContent = speaker;
}

function clearTimers() {
  if (app.timerId) clearInterval(app.timerId);
  if (app.speedTimerId) clearInterval(app.speedTimerId);
  app.timerId = null;
  app.speedTimerId = null;
}

function home() {
  clearTimers();
  setSceneVariant("scene-home-compact");
  setCharacterImage("stanko-office.png");
  $("homeButton").classList.add("hidden");
  setDialog(randomItem(app.introLines));
  $("content").innerHTML = `
    <div class="choice-grid main-choice-grid">
      <button class="choice" data-task="password">🔐 Potřebuji resetovat / odblokovat heslo</button>
      <button class="choice" data-task="network">🌐 Nefunguje síť</button>
      <button class="choice" data-task="printer">🖨️ Nefunguje tiskárna</button>
      <button class="choice" data-task="computer">🖥️ Nefunguje mi počítač</button>
      <button class="choice" data-task="allstaff">👥 Potřebuji povolit All Staff</button>
    </div>
  `;
  document.querySelectorAll("[data-task]").forEach((button) => {
    button.addEventListener("click", () => routeTask(button.dataset.task));
  });
}

function nextTask() { home(); }

function showHomeButton() {
  $("homeButton").classList.remove("hidden");
  $("homeButton").onclick = home;
}

function nextButton() {
  return `<div class="button-row"><button class="primary-button" id="nextTaskButton" type="button">DALŠÍ POŽADAVEK</button></div>`;
}

function passwordTask() {
  setCharacterImage("stanko-laugh.png");
  setDialog("Zase sis ztratil papírek s šestnáctimístným heslem? To snad ne.");
  $("content").innerHTML = `
    <div class="choice-grid">
      <button class="choice" id="urgentPassword">„Potřebuju okamžitě pracovat!“</button>
      <button class="choice" id="lockedPassword">„Pamatuju si heslo, ale zadal jsem ho 10× po sobě špatně.“</button>
    </div>
  `;
  $("urgentPassword").onclick = passwordUrgent;
  $("lockedPassword").onclick = passwordLocked;
}

function passwordUrgent() {
  setCharacterImage("stanko-thinking.png");
  const count = getColleagueCount();
  setColleagueCount(count + 1);
  setDialog(`Já potřebuju měsíc na Bahamách. Dneska už jsi ${count}. kolega.`);
  let remaining = 15;
  $("content").innerHTML = `<div class="note life-priority-note" id="bahamaNote">Stanko potřebuje chvilku na přehodnocení životních priorit...15</div>`;
  app.timerId = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      $("bahamaNote").textContent = `Stanko potřebuje chvilku na přehodnocení životních priorit...${remaining}`;
    } else {
      clearTimers();
      setDialog("Máš to hotovo kámo, co potřebuješ tentokrát?");
      $("content").innerHTML = nextButton();
      $("nextTaskButton").onclick = nextTask;
    }
  }, 1000);
}

function passwordLocked() {
  setCharacterImage("stanko-sideeye.png");
  setDialog("Opravdu chceš jen odblokovat účet?");
  $("content").innerHTML = `
    <div class="choice-grid">
      <button class="choice" id="yes1">„ANO“</button>
      <button class="choice" id="yes2">„ANO“</button>
    </div>
  `;
  $("yes1").onclick = startPasswordTimer;
  $("yes2").onclick = startPasswordTimer;
}

function startPasswordTimer() {
  clearTimers();
  setCharacterImage("stanko-watch.png");
  let remaining = app.timerSeconds;
  setDialog("To jsem zvědavej...");
  $("content").innerHTML = `
    <div class="timer-wrap">
      <div class="timer" id="passwordTimer">05:00</div>
      <div class="timer-label">Tak určitě, očekávám tě znovu...</div>
    </div>
  `;
  const timerEl = $("passwordTimer");
  const tick = () => {
    const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
    const seconds = (remaining % 60).toString().padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;
    if (remaining <= 0) {
      clearTimers();
      setCharacterImage("stanko-sunglasses.png");
      setDialog("Jasně, tvoje nové heslo je <strong>Uzivamsiinventec123***</strong>");
      $("content").innerHTML = nextButton();
      $("nextTaskButton").onclick = nextTask;
      return;
    }
    remaining -= 1;
  };
  tick();
  app.timerId = setInterval(tick, 1000);
}

function networkTask() {
  setCharacterImage("stanko-neutral.png");
  setDialog("Zase ty internety? Já bych to zakázal!");
  $("content").innerHTML = `
    <div class="choice-grid">
      <button class="choice" id="wifi">„Slabý Wi-Fi signál, pořád to vypadává!“</button>
      <button class="choice" id="slowInternet">„Mám strašně pomalý internet!“</button>
    </div>
  `;
  $("wifi").onclick = () => {
    setCharacterImage("stanko-laugh.png");
    setDialog("Zkusil jsi dát noťas na kabel?");
    $("content").innerHTML = nextButton();
    $("nextTaskButton").onclick = nextTask;
  };
  $("slowInternet").onclick = networkSpeedTest;
}

function networkSpeedTest() {
  setCharacterImage("stanko-surprised.png");
  setDialog("Podívejme se na to...");
  $("content").innerHTML = `
    <div class="speed-card">
      <div class="speed-row">
        <div class="speed-head"><span>DOWNLOAD</span><span id="downloadValue" class="speed-value">0 Mb/s</span></div>
        <div class="meter"><div id="downloadBar"></div></div>
      </div>
      <div class="speed-row">
        <div class="speed-head"><span>UPLOAD</span><span id="uploadValue" class="speed-value">0 Mb/s</span></div>
        <div class="meter"><div id="uploadBar"></div></div>
      </div>
      <div class="note">Měření probíhá…</div>
    </div>
  `;
  let elapsed = 0;
  app.speedTimerId = setInterval(() => {
    elapsed += 0.1;
    const progress = Math.min(elapsed / 7, 1);
    const curve = progress < 0.65 ? progress / 0.65 : 1;
    const download = Math.round((100 + Math.pow(curve, 1.8) * 987400) * 10) / 10;
    const upload = Math.round((80 + Math.pow(curve, 1.7) * 742600) * 10) / 10;
    $("downloadValue").textContent = `${download.toLocaleString("cs-CZ")} Mb/s`;
    $("uploadValue").textContent = `${upload.toLocaleString("cs-CZ")} Mb/s`;
    $("downloadBar").style.width = `${Math.min(100, progress * 100)}%`;
    $("uploadBar").style.width = `${Math.min(100, progress * 100)}%`;
    if (progress >= 1) {
      clearTimers();
      setTimeout(() => {
        setCharacterImage("stanko-sideeye.png");
        setDialog("...");
        $("content").innerHTML = nextButton();
        $("nextTaskButton").onclick = nextTask;
      }, 350);
    }
  }, 100);
}

function printerTask() {
  setCharacterImage("stanko-surprised.png");
  setDialog("Zase tiskárna? To snad ne!");
  $("content").innerHTML = `
    <div class="choice-grid">
      <button class="choice" id="printerSimple">„Prostě nefunguje.“</button>
      <button class="choice" id="printerDetailed">„Mám detailní popis problému.“</button>
    </div>
  `;
  $("printerSimple").onclick = () => {
    setCharacterImage("stanko-sad.png");
    setDialog("Já už fakt nevím, co s tím. Měli bychom koupit novou tiskárnu. Tohle je šunka, která mě pije krev.");
    $("content").innerHTML = nextButton();
    $("nextTaskButton").onclick = nextTask;
  };
  $("printerDetailed").onclick = printerDetailed;
}

function printerDetailed() {
  setSceneVariant("scene-printer-detailed-compact");
  setCharacterImage("stanko-thinking.png");
  setDialog("Hmm...");
  $("content").innerHTML = `
    <p class="thought"><strong>Myslí si Stanko:</strong><br>„To jsem zvědavý, co z tebe vypadne…“</p>
    <textarea id="problemDescription" maxlength="5000" placeholder="Napiš detailní popis problému..."></textarea>
    <div class="note"><span id="charCount" class="counter">0</span> / 155 znaků. Popiš problém co nejpodrobněji. Minimální délka popisu je 155 znaků.</div>
    <div class="button-row"><button class="primary-button" id="tellStanko" type="button" disabled>ŘÍCT TO STANKOVI</button></div>
  `;
  const textarea = $("problemDescription");
  const button = $("tellStanko");
  textarea.addEventListener("input", () => {
    $("charCount").textContent = textarea.value.length;
    button.disabled = textarea.value.length < 155;
  });
  button.onclick = () => {
    setCharacterImage("stanko-laugh.png");
    setDialog("Stačilo vypnout a zapnout tiskárnu.");
    $("content").innerHTML = nextButton();
    $("nextTaskButton").onclick = nextTask;
  };
}

function computerTask() {
  setCharacterImage("stanko-neutral.png");
  setDialog("Zkoušel jsi restart?");
  $("content").innerHTML = `
    <div class="choice-grid">
      <button class="choice" id="restartYes">„ANO“</button>
      <button class="choice" id="restartFive">„5× jsem ho restartoval“</button>
    </div>
  `;
  const done = () => {
    setCharacterImage("stanko-sunglasses.png");
    setDialog("Máš to hotovo, pomohl restart.");
    $("content").innerHTML = nextButton();
    $("nextTaskButton").onclick = nextTask;
  };
  $("restartYes").onclick = done;
  $("restartFive").onclick = done;
}

function allStaffTask() {
  setCharacterImage("stanko-smirk.png");
  setDialog("Muhahaha");
  $("content").innerHTML = `
    <div class="large-expression">🐦</div>
    <h2 class="section-title">POZOR!</h2>
    <p>Pokud se chceš dostat ke schvalovacímu kolečku, musíš posbírat kolem fabriky aspoň <strong>10 ptáků</strong>!</p>
    <div class="button-row"><button class="primary-button" id="openBirdGame">OTEVŘÍT HRU S PTÁKY</button></div>
  `;

  $("openBirdGame").onclick = () => {
    const birdWindow = window.open(
      "bird-game/index.html",
      "stankoBirdGame",
      "width=980,height=720,resizable=yes,scrollbars=no"
    );

    if (!birdWindow) {
      setDialog("Nepodařilo se otevřít hru s ptáky. Povol prosím vyskakovací okna pro tuto stránku.");
      return;
    }

    birdWindow.focus();
    setDialog("Pošli se nejdřív proletět s ptáky a vrať se, až bude hotovo...");

    const watchBirdGame = setInterval(() => {
      if (birdWindow.closed) {
        clearInterval(watchBirdGame);
        setCharacterImage("stanko-laugh.png");
        setDialog("Napiš si email na IT skupinu a musí ti to povolit manažer oddělení.");
        $("content").innerHTML = nextButton();
        $("nextTaskButton").onclick = nextTask;
      }
    }, 500);
  };
}

function routeTask(task) {
  clearTimers();
  setSceneVariant("");
  showHomeButton();
  if (task === "password") passwordTask();
  if (task === "network") networkTask();
  if (task === "printer") printerTask();
  if (task === "computer") computerTask();
  if (task === "allstaff") allStaffTask();
}

home();
