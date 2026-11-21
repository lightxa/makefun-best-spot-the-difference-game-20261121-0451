// Kembar Beda: coral reef painter. Same contract as paintMarket: base scene,
// then the differences in `applied` change panel B.
import { makeRng, circle, ellipse, rect, roundRect, poly, scatterDots, vGradient } from './common.js';

function drawFish(ctx, x, y, size, color, facingRight = true) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  const dir = facingRight ? 1 : -1;
  poly(ctx, [[x - dir * size * 0.9, y], [x - dir * size * 1.5, y - size * 0.55], [x - dir * size * 1.5, y + size * 0.55]], color);
  circle(ctx, x + dir * size * 0.45, y - size * 0.12, size * 0.14, '#10243a');
}

function drawSeaweed(ctx, x, baseY, height, color, sway) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + sway, baseY - height * 0.55, x + sway * 0.4, baseY - height);
  ctx.stroke();
}

function drawBubble(ctx, x, y, r) {
  ctx.strokeStyle = 'rgba(255,255,255,.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  circle(ctx, x - r * 0.3, y - r * 0.3, r * 0.25, 'rgba(255,255,255,.8)');
}

export function paintReef(ctx, w, h, applied) {
  const rng = makeRng(777001);
  // water
  ctx.fillStyle = vGradient(ctx, w, h, [[0, '#0a4d8c'], [0.5, '#0e7aa8'], [0.8, '#2aa5a0'], [1, '#e8d29a']]);
  ctx.fillRect(0, 0, w, h);
  // light rays from the surface
  ctx.fillStyle = 'rgba(255,255,220,.10)';
  for (const [x0, x1] of [[60, 120], [210, 250], [360, 420], [480, 520]]) {
    poly(ctx, [[x0, 0], [x1, 0], [x1 + 60, 330], [x0 + 30, 330]], 'rgba(255,255,220,.10)');
  }
  // plankton dots
  scatterDots(ctx, rng, 36, 10, 10, 550, 300, ['#cfefff', '#ffffff', '#ffe9a8'], 0.8, 1.8);
  // sandy floor
  ctx.fillStyle = '#e8d29a';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.quadraticCurveTo(140, 312, 280, 330);
  ctx.quadraticCurveTo(420, 348, 560, 328);
  ctx.lineTo(560, 400);
  ctx.lineTo(0, 400);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,120,60,.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(30 + i * 110, 352 + (i % 2) * 14);
    ctx.quadraticCurveTo(70 + i * 110, 344 + (i % 2) * 14, 110 + i * 110, 352 + (i % 2) * 14);
    ctx.stroke();
  }
  // rocks
  ellipse(ctx, 250, 348, 42, 18, '#8a8f96');
  ellipse(ctx, 300, 356, 30, 13, '#6f747b');
  ellipse(ctx, 40, 360, 34, 14, '#8a8f96');
  // branching pink coral, left
  ctx.strokeStyle = '#ff7eb6';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const branches = [[60, 340, 52, 300, 40, 272], [60, 340, 66, 296, 78, 268], [60, 340, 58, 306, 56, 282], [52, 300, 34, 282, 26, 264], [66, 296, 84, 280, 92, 262]];
  for (const [x0, y0, x1, y1, x2, y2] of branches) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x1, y1, x2, y2);
    ctx.stroke();
  }
  circle(ctx, 40, 272, 5, '#ff7eb6');
  circle(ctx, 78, 268, 5, '#ff7eb6');
  circle(ctx, 56, 282, 5, '#ff9ec6');
  circle(ctx, 26, 264, 4, '#ff7eb6');
  circle(ctx, 92, 262, 4, '#ff9ec6');
  // fan coral, right (colour is the 'karang' difference)
  const fanColor = applied.has('karang') ? '#b06eff' : '#ff8a3c';
  ctx.fillStyle = fanColor;
  ctx.beginPath();
  ctx.moveTo(430, 340);
  ctx.quadraticCurveTo(420, 268, 452, 246);
  ctx.quadraticCurveTo(486, 268, 476, 340);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.45)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(452, 330);
    ctx.quadraticCurveTo(452 + i * 12, 292, 452 + i * 18, 254);
    ctx.stroke();
  }
  // tube corals, centre
  for (const [x, hh, color] of [[330, 42, '#c96eff'], [344, 56, '#ff6fb0'], [358, 38, '#6ec6ff']]) {
    roundRect(ctx, x, 340 - hh, 12, hh, 6, color);
    ellipse(ctx, x + 6, 340 - hh, 6, 3, 'rgba(0,0,0,.25)');
  }
  // seaweed, left (tallest strand is the 'rumput' difference)
  drawSeaweed(ctx, 20, 348, applied.has('rumput') ? 62 : 108, '#2e8b6a', 14);
  drawSeaweed(ctx, 38, 350, 84, '#37a37e', -10);
  drawSeaweed(ctx, 528, 348, 96, '#2e8b6a', -12);
  drawSeaweed(ctx, 544, 350, 70, '#37a37e', 10);
  // school of small fish (one is the 'kawanan' difference)
  const school = [[70, 112, '#ffd34d'], [96, 118, '#ffd34d'], [122, 108, '#ffd34d'], [88, 138, '#ffb84d'], [118, 136, '#ffb84d']];
  for (const [x, y, color] of school) {
    if (x === 96 && applied.has('kawanan')) continue;
    drawFish(ctx, x, y, 11, color, true);
  }
  // big fish, centre (colour is the 'ikan' difference)
  drawFish(ctx, 282, 168, 26, applied.has('ikan') ? '#b06eff' : '#ff8a3c', true);
  drawFish(ctx, 210, 210, 16, '#6ec6ff', false);
  drawFish(ctx, 480, 210, 14, '#ffd34d', false);
  // turtle (flipper is the 'penyu' difference)
  ellipse(ctx, 402, 182, 30, 20, '#3f9e6e');
  circle(ctx, 434, 176, 11, '#3f9e6e');
  circle(ctx, 438, 173, 2, '#10243a');
  poly(ctx, [[372, 182], [352, 172], [352, 192]], '#2e7d55');
  ellipse(ctx, 408, 202, 14, 6, '#2e7d55', applied.has('penyu') ? -0.9 : 0.25);
  ellipse(ctx, 396, 164, 12, 5, '#2e7d55', -0.3);
  ctx.strokeStyle = '#2e7d55';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(402, 182, 14, 0, Math.PI * 2); ctx.stroke();
  // jellyfish (absent in B)
  if (!applied.has('ubur')) {
    ctx.fillStyle = 'rgba(255,182,220,.85)';
    ctx.beginPath();
    ctx.arc(470, 92, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,182,220,.8)';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(470 + i * 7, 92);
      ctx.quadraticCurveTo(470 + i * 9, 108, 470 + i * 6, 120);
      ctx.stroke();
    }
  }
  // bubbles (extra cluster is the 'gelembung' difference)
  drawBubble(ctx, 330, 120, 6);
  drawBubble(ctx, 344, 100, 4);
  drawBubble(ctx, 318, 96, 3);
  if (applied.has('gelembung')) {
    drawBubble(ctx, 356, 138, 7);
    drawBubble(ctx, 368, 122, 5);
    drawBubble(ctx, 348, 116, 4);
  }
  // starfish (absent in B)
  if (!applied.has('bintanglaut')) {
    ctx.fillStyle = '#ff8a5c';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? 15 : 6;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = 168 + Math.cos(a) * rad;
      const py = 356 + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    circle(ctx, 168, 356, 3, '#e86a3c');
  }
  // shell (open in A, closed in B)
  if (applied.has('kerang')) {
    ellipse(ctx, 512, 352, 16, 8, '#f2c9e8');
  } else {
    ellipse(ctx, 512, 346, 16, 7, '#f2c9e8');
    ellipse(ctx, 512, 356, 16, 7, '#e8a8d8');
    circle(ctx, 512, 350, 4, '#fff');
  }
  // treasure chest with a gem (colour is the 'permata' difference)
  roundRect(ctx, 96, 322, 46, 26, 5, '#8a5a30');
  ctx.fillStyle = '#6e4520';
  ctx.beginPath();
  ctx.arc(119, 322, 23, Math.PI, 0);
  ctx.fill();
  rect(ctx, 116, 318, 6, 34, '#ffd34d');
  poly(ctx, [[119, 312], [127, 320], [119, 328], [111, 320]], applied.has('permata') ? '#ff4dd2' : '#4dd2ff');
  circle(ctx, 134, 334, 3, '#ffd34d');
  circle(ctx, 104, 336, 3, '#ffd34d');
}
