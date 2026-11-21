// Kembar Beda: deterministic states for screenshots and the headless self-test.
// A shot mode is a real state of the real game: it starts a level, marks real
// differences found, sets a real timer value, or opens a real overlay. The
// screenshots are renders of the game itself, never composites.
import { SCENES } from './scenes.js';

function pauseTimer(game) {
  // Screenshots must not race the clock: freeze with plenty of time left.
  game.setTimeLeft(154);
}

export function applyShot(game, shot) {
  if (shot === 'cover') {
    // Mid-game, night market: 4 found with gold rings, 6 still hidden.
    game.startLevel(0);
    game.forceFound(4);
    pauseTimer(game);
  } else if (shot === 'reef') {
    // Coral reef, 3 found, counter visible.
    game.startLevel(1);
    game.forceFound(3);
    pauseTimer(game);
  } else if (shot === 'hint') {
    // Night market with the hint ring pulsing on one unfound difference.
    game.startLevel(0);
    game.forceFound(2);
    game.hintOne(7);
    pauseTimer(game);
  } else if (shot === 'win') {
    // Night market completed: all 10 found, level-complete overlay with stars.
    // Set the timer first so the time bonus matches the clock shown.
    game.startLevel(0);
    game.setTimeLeft(96);
    game.completeLevelNow();
  } else if (shot === 'observatory') {
    // Mountain observatory, 6 found.
    game.startLevel(2);
    game.forceFound(6);
    pauseTimer(game);
  } else {
    game.showTitle();
  }
}

/** Headless self-test (?selftest=1): plays the real game through its own
 * click path and writes a one-line verdict into #testout for the harness. */
export function runSelfTest(game) {
  const out = [];
  const check = (name, ok) => out.push(`${name}:${ok ? 'PASS' : 'FAIL'}`);
  try {
    game.startLevel(0);
    const s = game.state;
    check('starts-playing', s.screen === 'playing');
    check('scene-is-market', game.scene().id === 'pasar');
    check('counter-0', s.found.size === 0);
    // click the first difference on panel A (its exact spot)
    const d0 = SCENES[0].diffs[0];
    game.checkSpot('a', d0.x, d0.y);
    check('find-registers', s.found.size === 1 && s.score >= 100);
    // click the same spot again: must not double-count
    game.checkSpot('a', d0.x, d0.y);
    check('no-double-count', s.found.size === 1);
    // click empty sky: a miss costs 25 and resets the combo
    const before = s.score;
    game.checkSpot('b', 30, 30);
    check('miss-costs', s.misses === 1 && s.score === before - 25);
    // a hint spends one of three and targets an unfound difference
    const hintsBefore = s.hintsLeft;
    game.useHint();
    check('hint-spends', s.hintsLeft === hintsBefore - 1 && s.hintTarget !== null);
    // find the remaining 9: level must complete with a bonus
    for (const d of SCENES[0].diffs.slice(1)) game.checkSpot('a', d.x, d.y);
    check('level-completes', s.screen === 'levelComplete' && s.found.size === 10);
    check('bonus-added', s.score > 1000);
    // scene 2 starts clean
    game.startLevel(1);
    check('next-scene-clean', s.screen === 'playing' && s.found.size === 0 && game.scene().id === 'karang');
    // timer runs down and ends the level
    game.setTimeLeft(0.05);
    setTimeout(() => {
      check('time-up', s.screen === 'timeUp');
      document.getElementById('testout').textContent = `SELFTEST ${out.join(' ')}`;
      document.title = `SELFTEST ${out.every((l) => l.endsWith('PASS')) ? 'ALL-PASS' : 'HAS-FAIL'}`;
    }, 600);
    document.getElementById('testout').textContent = `SELFTEST ${out.join(' ')} (waiting-timer)`;
  } catch (err) {
    document.getElementById('testout').textContent = `SELFTEST ERROR ${err.message}`;
    document.title = 'SELFTEST ERROR';
  }
}
