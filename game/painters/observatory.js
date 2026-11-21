// Kembar Beda: mountain observatory painter. Same contract as paintMarket:
// base scene, then the differences in `applied` change panel B.
import { makeRng, circle, ellipse, rect, roundRect, poly, sparkle, scatterDots, vGradient } from './common.js';

function drawPine(ctx, x, y, s, color) {
  poly(ctx, [[x, y - 46 * s], [x - 20 * s, y - 8 * s], [x + 20 * s, y - 8 * s]], color);
  poly(ctx, [[x, y - 62 * s], [x - 15 * s, y - 30 * s], [x + 15 * s, y - 30 * s]], color);
  rect(ctx, x - 3 * s, y - 8 * s, 6 * s, 10 * s, '#5a3a22');
}

function drawMountain(ctx, x0, peakY, baseY, color, snow) {
  poly(ctx, [[x0 - 150, baseY], [x0, peakY], [x0 + 150, baseY]], color);
  if (snow) {
    poly(ctx, [[x0 - 34, peakY + 30], [x0, peakY], [x0 + 34, peakY + 30], [x0 + 16, peakY + 26], [x0, peakY + 36], [x0 - 16, peakY + 26]], '#f4f8ff');
  }
}

export function paintObservatory(ctx, w, h, applied) {
  const rng = makeRng(424242);
  // night sky
  ctx.fillStyle = vGradient(ctx, w, h, [[0, '#0a1030'], [0.55, '#1a2a5e'], [0.8, '#3a3a6e'], [1, '#1a1a2e']]);
  ctx.fillRect(0, 0, w, h);
  // milky way band
  scatterDots(ctx, rng, 60, 20, 10, 540, 200, ['#cfe0ff', '#ffffff', '#ffe9a8'], 0.7, 1.8);
  sparkle(ctx, 90, 40, 4, '#fff');
  sparkle(ctx, 250, 90, 3.5, '#fff6c9');
  sparkle(ctx, 400, 30, 4, '#fff');
  sparkle(ctx, 520, 120, 3, '#cfe0ff');
  // moon with craters (count is the 'bulan' difference)
  circle(ctx, 478, 58, 24, '#f2ecd8');
  circle(ctx, 470, 52, 4, '#d8cfae');
  circle(ctx, 486, 64, 5, '#d8cfae');
  if (applied.has('bulan')) circle(ctx, 478, 44, 3.5, '#d8cfae');
  // comet (absent in B)
  if (!applied.has('komet')) {
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(150, 62);
    ctx.lineTo(96, 34);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(146, 60);
    ctx.lineTo(112, 42);
    ctx.stroke();
    sparkle(ctx, 150, 62, 6, '#fff');
  }
  // mountains
  drawMountain(ctx, 120, 190, 400, '#2c3a6e', true);
  drawMountain(ctx, 356, 132, 400, '#22305e', !applied.has('salju'));
  drawMountain(ctx, 500, 210, 400, '#31447a', true);
  // observatory hill and dome
  ellipse(ctx, 200, 300, 130, 44, '#1c2a4e');
  ctx.fillStyle = '#e8e4da';
  ctx.beginPath();
  ctx.arc(196, 218, 52, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 144, 218, 104, 62, '#d8d2c2');
  // dome slit and telescope (angle is the 'teleskop' difference)
  ctx.fillStyle = '#2c2a4e';
  poly(ctx, [[188, 172], [204, 172], [200, 218], [192, 218]], '#2c2a4e');
  ctx.strokeStyle = '#8a8f96';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(196, 176);
  if (applied.has('teleskop')) ctx.lineTo(226, 168);
  else ctx.lineTo(222, 148);
  ctx.stroke();
  circle(ctx, 196, 176, 6, '#5a5f6b');
  // dome beacon (off in B) and flag (direction is the 'bendera' difference)
  if (!applied.has('lampu')) {
    circle(ctx, 196, 108, 5, '#ff4d4d');
    circle(ctx, 196, 108, 9, 'rgba(255,77,77,.35)');
  }
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(196, 104);
  ctx.lineTo(196, 82);
  ctx.stroke();
  if (applied.has('bendera')) poly(ctx, [[196, 82], [176, 87], [196, 93]], '#ff8a5c');
  else poly(ctx, [[196, 82], [216, 87], [196, 93]], '#ff8a5c');
  // observatory windows
  roundRect(ctx, 158, 238, 18, 24, 4, '#ffd34d');
  roundRect(ctx, 216, 238, 18, 24, 4, '#ffd34d');
  // pine forest
  drawPine(ctx, 40, 330, 1.1, '#14301e');
  drawPine(ctx, 88, 302, 0.9, '#1a3a26');
  drawPine(ctx, 300, 330, 1.0, '#14301e');
  drawPine(ctx, 336, 312, 0.8, '#1a3a26');
  drawPine(ctx, 520, 322, 1.0, '#14301e');
  if (applied.has('pinus')) drawPine(ctx, 88, 302, 0.55, '#1a3a26');
  // owl on a branch (eyes open in A, closed in B)
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(300, 252);
  ctx.lineTo(352, 246);
  ctx.stroke();
  ellipse(ctx, 326, 236, 12, 15, '#6e4a2f');
  circle(ctx, 326, 220, 9, '#6e4a2f');
  poly(ctx, [[319, 213], [320, 204], [324, 211]], '#6e4a2f');
  poly(ctx, [[329, 211], [333, 203], [333, 213]], '#6e4a2f');
  if (applied.has('hantu')) {
    ctx.strokeStyle = '#241a3a';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(319, 219); ctx.lineTo(324, 219); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(328, 219); ctx.lineTo(333, 219); ctx.stroke();
  } else {
    circle(ctx, 322, 219, 2.4, '#ffd34d');
    circle(ctx, 330, 219, 2.4, '#ffd34d');
    circle(ctx, 322, 219, 1.1, '#241a3a');
    circle(ctx, 330, 219, 1.1, '#241a3a');
  }
  // cabin on the right with lit windows (one dark in B)
  roundRect(ctx, 420, 268, 76, 56, 4, '#5a3a22');
  poly(ctx, [[412, 270], [458, 240], [504, 270]], '#3a2412');
  rect(ctx, 452, 300, 14, 24, '#2c1a10');
  rect(ctx, 430, 282, 16, 16, '#ffd34d');
  rect(ctx, 470, 282, 16, 16, applied.has('jendela') ? '#1a2a4e' : '#ffd34d');
  // chimney smoke
  ctx.fillStyle = 'rgba(230,230,240,.55)';
  circle(ctx, 486, 238, 5, 'rgba(230,230,240,.55)');
  circle(ctx, 492, 226, 7, 'rgba(230,230,240,.45)');
  circle(ctx, 500, 212, 9, 'rgba(230,230,240,.35)');
  // path with lanterns (colour is the 'lentera' difference)
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath();
  ctx.moveTo(300, 400);
  ctx.lineTo(360, 330);
  ctx.lineTo(420, 330);
  ctx.lineTo(470, 400);
  ctx.closePath();
  ctx.fill();
  for (const [x, y] of [[352, 336], [386, 330], [420, 336]]) {
    const isDiff = x === 386;
    circle(ctx, x, y, 6, isDiff && applied.has('lentera') ? '#6ec6ff' : '#ffb84d');
    circle(ctx, x, y, 11, isDiff && applied.has('lentera') ? 'rgba(110,198,255,.3)' : 'rgba(255,184,77,.3)');
    rect(ctx, x - 1, y + 6, 2, 8, '#241a12');
  }
  // snow ground
  ctx.fillStyle = '#e8eefc';
  ctx.beginPath();
  ctx.moveTo(0, 372);
  ctx.quadraticCurveTo(180, 356, 340, 372);
  ctx.quadraticCurveTo(460, 384, 560, 368);
  ctx.lineTo(560, 400);
  ctx.lineTo(0, 400);
  ctx.closePath();
  ctx.fill();
  // snowflakes
  scatterDots(ctx, rng, 18, 10, 200, 550, 380, ['#ffffff'], 1, 2.2);
}
