// Kembar Beda: bootstrap. Creates the game, then applies a deterministic
// screenshot mode from the URL (?shot=...) or runs the headless self-test
// (?selftest=1). Normal play opens with no query at all.
import { createGame } from './game.js';
import { applyShot, runSelfTest } from './shots.js';

const game = createGame();
window.__game = game;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(game, shot);
} else if (params.get('selftest') === '1') {
  runSelfTest(game);
}
