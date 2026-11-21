// Kembar Beda: game state, input, timer, scoring, hints, markers and particles.
// Owns the HUD and the overlays; the painters own the pictures.
import { SCENES, DIFFICULTIES, PANEL_W, PANEL_H } from './scenes.js';
import { paintMarket } from '../painters/market.js';
import { paintReef } from '../painters/reef.js';
import { paintObservatory } from '../painters/observatory.js';
import { playFind, playMiss, playHint, playClick, playWin, playLose, toggleMute, isMuted } from './audio.js';

const PAINTERS = { market: paintMarket, reef: paintReef, observatory: paintObservatory };
const PANEL_GAP = 24;
const PANEL_B_X = PANEL_W + PANEL_GAP;

const $ = (id) => document.getElementById(id);

export function createGame() {
  const canvasA = $('canvas-a');
  const canvasB = $('canvas-b');
  const fx = $('fx');
  const ctxA = canvasA.getContext('2d');
  const ctxB = canvasB.getContext('2d');
  const ctxFx = fx.getContext('2d');
  const offA = document.createElement('canvas');
  const offB = document.createElement('canvas');
  offA.width = PANEL_W;
  offA.height = PANEL_H;
  offB.width = PANEL_W;
  offB.height = PANEL_H;

  const state = {
    screen: 'title',
    sceneIndex: 0,
    difficulty: DIFFICULTIES.klasik,
    found: new Set(),
    hintsLeft: 3,
    hintsUsed: 0,
    misses: 0,
    combo: 0,
    score: 0,
    levelScore: 0,
    timeLeft: 180,
    timeTotal: 180,
    hintTarget: null,
    hintUntil: 0,
    particles: [],
    cursor: { x: PANEL_W / 2, y: PANEL_H / 2, panel: 'a', visible: false },
    flash: null,
    totalFound: 0,
    levelsDone: 0,
  };

  let lastTs = 0;
  let toastTimer = 0;

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function showToast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  function renderPanels() {
    const paint = PAINTERS[scene().painter];
    const allIds = new Set(scene().diffs.map((d) => d.id));
    paint(offA.getContext('2d'), PANEL_W, PANEL_H, new Set());
    paint(offB.getContext('2d'), PANEL_W, PANEL_H, allIds);
  }

  function spawnSparkles(stageX, y, color) {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 90;
      state.particles.push({
        x: stageX, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30,
        life: 0.7 + Math.random() * 0.4, age: 0, r: 2 + Math.random() * 3.5, color,
      });
    }
  }

  function markFound(diff) {
    state.found.add(diff.id);
    state.combo += 1;
    const points = 100 + (state.combo - 1) * 20;
    state.score += points;
    state.levelScore += points;
    state.totalFound += 1;
    spawnSparkles(diff.x, diff.y, '#ffc93c');
    spawnSparkles(PANEL_B_X + diff.x, diff.y, '#ffc93c');
    playFind(state.combo);
    showToast(`Ketemu! ${diff.label}  +${points}`);
    updateHud();
    if (state.found.size === scene().diffs.length) levelComplete();
  }

  function checkSpot(panel, x, y) {
    if (state.screen !== 'playing') return;
    const now = performance.now();
    // Clicking a difference already found is a no-op, never a miss: the
    // player is re-checking a spot they already solved.
    for (const diff of scene().diffs) {
      if (!state.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= (diff.r + 7) * (diff.r + 7)) return;
    }
    for (const diff of scene().diffs) {
      if (state.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= (diff.r + 7) * (diff.r + 7)) {
        markFound(diff);
        return;
      }
    }
    // a miss: red X flash, combo lost, small penalty
    state.misses += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - 25);
    state.levelScore = Math.max(0, state.levelScore - 25);
    const stageX = panel === 'a' ? x : PANEL_B_X + x;
    state.flash = { x: stageX, y, until: now + 450 };
    playMiss();
    showToast('Bukan di situ. -25');
    updateHud();
  }

  function useHint() {
    if (state.screen !== 'playing') return false;
    if (state.hintsLeft <= 0) {
      showToast('Petunjuk habis!');
      return false;
    }
    const remaining = scene().diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return false;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.hintsUsed += 1;
    state.score = Math.max(0, state.score - 50);
    state.levelScore = Math.max(0, state.levelScore - 50);
    state.hintTarget = diff;
    state.hintUntil = performance.now() + 2600;
    playHint();
    showToast(`Petunjuk: ${diff.hint}`);
    updateHud();
    return true;
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function updateHud() {
    $('hud-scene').textContent = scene().name;
    $('hud-counter').textContent = `${state.found.size} / ${scene().diffs.length}`;
    $('hud-timer').textContent = formatTime(state.timeLeft);
    $('hud-score').textContent = String(state.score);
    $('hud-hints').textContent = '\u25CF'.repeat(state.hintsLeft) + '\u25CB'.repeat(3 - state.hintsLeft);
    $('hud-combo').textContent = `x${Math.max(1, state.combo)}`;
    $('hud-level').textContent = `Level ${state.sceneIndex + 1} dari ${SCENES.length}`;
    const box = $('timer-box');
    const frac = state.timeLeft / state.timeTotal;
    $('timer-fill').style.width = `${Math.max(0, frac * 100)}%`;
    box.classList.toggle('low', state.timeLeft <= 30 && state.screen === 'playing');
    $('btn-hint').disabled = state.screen !== 'playing' || state.hintsLeft <= 0;
  }

  function showOverlay(html) {
    $('overlay-card').innerHTML = html;
    $('overlay').classList.add('show');
  }

  function hideOverlay() {
    $('overlay').classList.remove('show');
  }

  function buildTitleCard() {
    const scenes = SCENES.map((s, i) => `
      <button type="button" class="scene-btn${i === state.sceneIndex ? ' picked' : ''}" data-scene="${i}">
        <span class="scene-emoji">${s.emoji}</span>
        <span class="scene-name">${s.name}</span>
        <span class="scene-sub">${s.sub}</span>
      </button>`).join('');
    return `
      <h2 id="overlay-title">KEMBAR BEDA</h2>
      <p id="overlay-text">Dua gambar tampak sama. Padahal ada 10 perbedaan tersembunyi di setiap dunia. Temukan semuanya sebelum waktu habis.</p>
      <div id="scene-pick">${scenes}</div>
      <div id="diff-pick">
        <span class="pick-label">Kesulitan</span>
        <button type="button" data-diff="santai" class="diff-btn${state.difficulty.id === 'santai' ? ' picked' : ''}">Santai &middot; 5:00</button>
        <button type="button" data-diff="klasik" class="diff-btn${state.difficulty.id === 'klasik' ? ' picked' : ''}">Klasik &middot; 3:00</button>
        <button type="button" data-diff="kilat" class="diff-btn${state.difficulty.id === 'kilat' ? ' picked' : ''}">Kilat &middot; 1:30</button>
      </div>
      <button id="overlay-btn" type="button">Mulai Bermain</button>
      <p id="overlay-foot">Klik yang salah mengurangi skor. Petunjuk terbatas: 3 per level.</p>`;
  }

  function showTitle() {
    state.screen = 'title';
    showOverlay(buildTitleCard());
    wireOverlayButtons();
    updateHud();
  }

  function wireOverlayButtons() {
    const card = $('overlay-card');
    card.querySelectorAll('[data-scene]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.sceneIndex = Number(btn.dataset.scene);
        playClick();
        showTitle();
      });
    });
    card.querySelectorAll('[data-diff]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.difficulty = DIFFICULTIES[btn.dataset.diff];
        playClick();
        showTitle();
      });
    });
    const start = $('overlay-btn');
    if (start) {
      start.addEventListener('click', () => {
        playClick();
        startLevel(state.sceneIndex);
      });
    }
  }

  function startLevel(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.hintsLeft = 3;
    state.hintsUsed = 0;
    state.misses = 0;
    state.combo = 0;
    state.levelScore = 0;
    state.timeTotal = state.difficulty.seconds;
    state.timeLeft = state.difficulty.seconds;
    state.hintTarget = null;
    state.particles = [];
    state.flash = null;
    renderPanels();
    state.screen = 'playing';
    hideOverlay();
    updateHud();
  }

  function starsForLevel() {
    if (state.misses === 0 && state.hintsUsed === 0) return 3;
    if (state.misses <= 2) return 2;
    return 1;
  }

  function levelComplete() {
    const bonus = Math.round(state.timeLeft) * 5;
    state.score += bonus;
    state.levelScore += bonus;
    state.levelsDone += 1;
    const stars = starsForLevel();
    state.screen = 'levelComplete';
    playWin();
    updateHud();
    const last = state.sceneIndex === SCENES.length - 1;
    showOverlay(`
      <div class="stars">${'\u2605'.repeat(stars)}${'\u2606'.repeat(3 - stars)}</div>
      <h2 id="overlay-title">DUNIA SELESAI!</h2>
      <p id="overlay-text">${scene().tagline}</p>
      <p id="overlay-stats">Semua <b>10 perbedaan</b> ketemu di ${scene().name}.<br>
      Skor level <b>${state.levelScore}</b> (bonus waktu +${bonus}) &middot; Salah klik <b>${state.misses}</b> &middot; Petunjuk dipakai <b>${state.hintsUsed}</b><br>
      Skor total <b>${state.score}</b></p>
      <button id="overlay-btn" type="button">${last ? 'Lihat Hasil Akhir' : 'Lanjut ke Dunia Berikut'}</button>`);
    $('overlay-btn').addEventListener('click', () => {
      playClick();
      if (last) showVictory();
      else startLevel(state.sceneIndex + 1);
    });
  }

  function showVictory() {
    state.screen = 'victory';
    showOverlay(`
      <div class="stars">\u2605\u2605\u2605</div>
      <h2 id="overlay-title">MATA ELANG!</h2>
      <p id="overlay-text">Kamu menemukan semua 30 perbedaan di tiga dunia. Tidak ada yang lolos dari matamu.</p>
      <p id="overlay-stats">Skor akhir <b>${state.score}</b> &middot; Total ketemu <b>${state.totalFound} / 30</b><br>
      Main lagi untuk skor lebih tinggi, atau coba kesulitan Kilat.</p>
      <button id="overlay-btn" type="button">Main Lagi</button>`);
    $('overlay-btn').addEventListener('click', () => {
      playClick();
      state.score = 0;
      state.totalFound = 0;
      state.levelsDone = 0;
      showTitle();
    });
  }

  function timeUp() {
    state.screen = 'timeUp';
    playLose();
    updateHud();
    showOverlay(`
      <h2 id="overlay-title">WAKTU HABIS</h2>
      <p id="overlay-text">Kamu menemukan <b>${state.found.size} dari 10</b> perbedaan di ${scene().name}. Yang ${10 - state.found.size} sisanya masih bersembunyi.</p>
      <button id="overlay-btn" type="button">Coba Lagi Dunia Ini</button>
      <p id="overlay-foot">Tips: petunjuk (H) menunjukkan satu perbedaan yang belum ketemu.</p>`);
    $('overlay-btn').addEventListener('click', () => {
      playClick();
      startLevel(state.sceneIndex);
    });
  }

  function drawMarkers(ctx, panelX) {
    for (const diff of scene().diffs) {
      if (!state.found.has(diff.id)) continue;
      ctx.strokeStyle = '#ffc93c';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,201,60,.22)';
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r + 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffc93c';
      ctx.font = 'bold 15px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2713', diff.x, diff.y - diff.r - 12);
    }
    if (state.hintTarget && performance.now() < state.hintUntil) {
      const pulse = 1 + 0.18 * Math.sin(performance.now() / 130);
      const d = state.hintTarget;
      ctx.strokeStyle = '#6ec6ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(d.x, d.y, (d.r + 12) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawFrame(ts) {
    const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    if (state.screen === 'playing') {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        updateHud();
        timeUp();
      } else {
        updateHud();
      }
    }
    // panels
    ctxA.drawImage(offA, 0, 0);
    ctxB.drawImage(offB, 0, 0);
    if (state.screen !== 'title') {
      drawMarkers(ctxA, 0);
      drawMarkers(ctxB, PANEL_B_X);
    }
    // fx overlay: particles, miss flash, keyboard cursor
    ctxFx.clearRect(0, 0, fx.width, fx.height);
    const now = performance.now();
    state.particles = state.particles.filter((p) => p.age < p.life);
    for (const p of state.particles) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      ctxFx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctxFx.fillStyle = p.color;
      ctxFx.beginPath();
      ctxFx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctxFx.fill();
    }
    ctxFx.globalAlpha = 1;
    if (state.flash && now < state.flash.until) {
      ctxFx.strokeStyle = '#ff6b6b';
      ctxFx.lineWidth = 4;
      const s = 12;
      ctxFx.beginPath();
      ctxFx.moveTo(state.flash.x - s, state.flash.y - s);
      ctxFx.lineTo(state.flash.x + s, state.flash.y + s);
      ctxFx.moveTo(state.flash.x + s, state.flash.y - s);
      ctxFx.lineTo(state.flash.x - s, state.flash.y + s);
      ctxFx.stroke();
    }
    if (state.cursor.visible && state.screen === 'playing') {
      const cx = state.cursor.panel === 'a' ? state.cursor.x : PANEL_B_X + state.cursor.x;
      ctxFx.strokeStyle = '#ffffff';
      ctxFx.lineWidth = 2;
      ctxFx.beginPath();
      ctxFx.arc(cx, state.cursor.y, 13, 0, Math.PI * 2);
      ctxFx.stroke();
      ctxFx.beginPath();
      ctxFx.moveTo(cx - 19, state.cursor.y);
      ctxFx.lineTo(cx - 7, state.cursor.y);
      ctxFx.moveTo(cx + 7, state.cursor.y);
      ctxFx.lineTo(cx + 19, state.cursor.y);
      ctxFx.moveTo(cx, state.cursor.y - 19);
      ctxFx.lineTo(cx, state.cursor.y - 7);
      ctxFx.moveTo(cx, state.cursor.y + 7);
      ctxFx.lineTo(cx, state.cursor.y + 19);
      ctxFx.stroke();
    }
    requestAnimationFrame(drawFrame);
  }

  function canvasPoint(canvas, event) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - r.left) / r.width) * PANEL_W,
      y: ((event.clientY - r.top) / r.height) * PANEL_H,
    };
  }

  canvasA.addEventListener('click', (event) => {
    const p = canvasPoint(canvasA, event);
    state.cursor = { x: p.x, y: p.y, panel: 'a', visible: true };
    checkSpot('a', p.x, p.y);
  });
  canvasB.addEventListener('click', (event) => {
    const p = canvasPoint(canvasB, event);
    state.cursor = { x: p.x, y: p.y, panel: 'b', visible: true };
    checkSpot('b', p.x, p.y);
  });
  for (const [canvas, panel] of [[canvasA, 'a'], [canvasB, 'b']]) {
    canvas.addEventListener('mousemove', (event) => {
      const p = canvasPoint(canvas, event);
      state.cursor = { x: p.x, y: p.y, panel, visible: true };
    });
    canvas.addEventListener('mouseleave', () => {
      state.cursor.visible = false;
    });
  }

  document.addEventListener('keydown', (event) => {
    if (state.screen === 'playing') {
      const step = event.shiftKey ? 4 : 14;
      if (event.key === 'ArrowLeft') { state.cursor.x = Math.max(0, state.cursor.x - step); state.cursor.visible = true; event.preventDefault(); }
      else if (event.key === 'ArrowRight') { state.cursor.x = Math.min(PANEL_W, state.cursor.x + step); state.cursor.visible = true; event.preventDefault(); }
      else if (event.key === 'ArrowUp') { state.cursor.y = Math.max(0, state.cursor.y - step); state.cursor.visible = true; event.preventDefault(); }
      else if (event.key === 'ArrowDown') { state.cursor.y = Math.min(PANEL_H, state.cursor.y + step); state.cursor.visible = true; event.preventDefault(); }
      else if (event.key === 'Enter' || event.key === ' ') { checkSpot(state.cursor.panel, state.cursor.x, state.cursor.y); event.preventDefault(); }
      else if (event.key === 'h' || event.key === 'H') useHint();
      else if (event.key === 'r' || event.key === 'R') startLevel(state.sceneIndex);
    }
    if (event.key === 'm' || event.key === 'M') {
      const nowMuted = toggleMute();
      $('btn-sound').textContent = nowMuted ? '\u266A Senyap' : '\u266A Suara';
    }
    if (event.key === 'n' || event.key === 'N') {
      if (state.screen === 'levelComplete') {
        const btn = $('overlay-btn');
        if (btn) btn.click();
      }
    }
    if (event.key === 'Enter' && state.screen === 'title') {
      startLevel(state.sceneIndex);
    }
  });

  $('btn-hint').addEventListener('click', () => useHint());
  $('btn-restart').addEventListener('click', () => {
    if (state.screen === 'playing') startLevel(state.sceneIndex);
    else showTitle();
  });
  $('btn-sound').addEventListener('click', () => {
    const nowMuted = toggleMute();
    $('btn-sound').textContent = nowMuted ? '\u266A Senyap' : '\u266A Suara';
  });

  renderPanels();
  showTitle();
  requestAnimationFrame(drawFrame);

  // Test/debug handle: the screenshot modes and the self-test use it.
  const api = {
    state,
    scene,
    startLevel,
    showTitle,
    useHint,
    checkSpot,
    setTimeLeft(seconds) {
      state.timeLeft = seconds;
      updateHud();
    },
    forceFound(count) {
      // Shot modes mark real finds: same points and combo as real clicks,
      // so the HUD score matches the found counter in screenshots.
      const diffs = scene().diffs.slice(0, count);
      for (const d of diffs) {
        state.found.add(d.id);
        state.combo += 1;
        const points = 100 + (state.combo - 1) * 20;
        state.score += points;
        state.levelScore += points;
        state.totalFound += 1;
      }
      updateHud();
    },
    hintOne(index) {
      const diff = scene().diffs[index];
      state.hintTarget = diff;
      state.hintUntil = performance.now() + 60000;
      updateHud();
    },
    completeLevelNow() {
      // Shot mode: award the same per-find points as real clicks, so the
      // level score and the timer bonus agree in the win screenshot.
      for (const d of scene().diffs) {
        if (state.found.has(d.id)) continue;
        state.found.add(d.id);
        state.combo += 1;
        const points = 100 + (state.combo - 1) * 20;
        state.score += points;
        state.levelScore += points;
        state.totalFound += 1;
      }
      updateHud();
      levelComplete();
    },
  };
  return api;
}
