// Kembar Beda: night market painter. Draws the base scene, then applies the
// differences in `applied` (a Set of diff ids) so panel B differs from A.
import { makeRng, circle, ellipse, rect, roundRect, poly, sparkle, scatterDots, vGradient } from './common.js';

function drawStall(ctx, x, y, w, awningColors, signText, goods) {
  // posts and counter
  rect(ctx, x, y + 58, 8, 92, '#5a3a22');
  rect(ctx, x + w - 8, y + 58, 8, 92, '#5a3a22');
  roundRect(ctx, x - 6, y + 96, w + 12, 54, 6, '#7a4a28');
  rect(ctx, x - 6, y + 96, w + 12, 10, '#96603a');
  // striped awning
  for (let i = 0; i < 6; i++) {
    poly(ctx, [
      [x + (i * w) / 6, y], [x + ((i + 1) * w) / 6, y],
      [x + ((i + 1) * w) / 6 + 6, y + 34], [x + (i * w) / 6 + 6, y + 34],
    ], awningColors[i % 2]);
  }
  rect(ctx, x - 4, y + 30, w + 8, 6, '#3c2412');
  // sign board
  roundRect(ctx, x + 14, y + 40, w - 28, 22, 5, '#2c1a4d');
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(signText, x + w / 2, y + 52);
  // goods on the counter
  goods(ctx, x, y + 96);
}

function drawFruitPile(ctx, x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const px = x + (i % 4) * 13 - 18;
    const py = y - Math.floor(i / 4) * 12;
    circle(ctx, px, py, 7, color);
    circle(ctx, px - 2, py - 2, 2, 'rgba(255,255,255,.45)');
  }
}

function drawJar(ctx, x, y, color) {
  roundRect(ctx, x - 7, y - 16, 14, 20, 4, color);
  rect(ctx, x - 8, y - 20, 16, 5, '#d8c49a');
}

export function paintMarket(ctx, w, h, applied) {
  const rng = makeRng(20261121);
  // dusk sky
  ctx.fillStyle = vGradient(ctx, w, h, [[0, '#2b1a4d'], [0.55, '#7a3a6e'], [0.75, '#ff9a5c'], [1, '#3a2418']]);
  ctx.fillRect(0, 0, w, h);
  // stars (one of them is the 'bintang' difference)
  scatterDots(ctx, rng, 42, 8, 8, 540, 130, ['#fff6c9', '#ffe9a8', '#ffffff'], 0.8, 2.0);
  if (!applied.has('bintang')) sparkle(ctx, 302, 42, 5, '#fff6c9');
  // moon: full in A, crescent in B
  circle(ctx, 472, 56, 26, '#ffeec2');
  circle(ctx, 466, 52, 5, '#e8d39a');
  circle(ctx, 482, 64, 4, '#e8d39a');
  if (applied.has('bulan')) circle(ctx, 484, 48, 22, '#3a2a5e');
  // distant rooftops
  ctx.fillStyle = '#241640';
  poly(ctx, [[0, 210], [70, 150], [150, 210]], '#241640');
  poly(ctx, [[120, 210], [220, 138], [320, 210]], '#1d1136');
  poly(ctx, [[300, 210], [420, 152], [520, 210]], '#241640');
  poly(ctx, [[500, 210], [560, 168], [560, 210]], '#1d1136');
  // string lights across the top
  ctx.strokeStyle = '#1a1030';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 44);
  ctx.quadraticCurveTo(280, 108, 560, 40);
  ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const x = t * 560;
    const y = 44 + Math.sin(t * Math.PI) * 42 - 8;
    const colors = ['#ffd34d', '#ff8a5c', '#7be495', '#6ec6ff'];
    const isDiff = i === 3;
    circle(ctx, x, y + 8, 6, isDiff && applied.has('lampion') ? '#ff4d6d' : colors[i % 4]);
    circle(ctx, x - 2, y + 6, 2, 'rgba(255,255,255,.7)');
  }
  // extra bird on the wire (only in B)
  if (applied.has('burung')) {
    ellipse(ctx, 252, 66, 9, 6, '#241a3a');
    circle(ctx, 259, 61, 4, '#241a3a');
    poly(ctx, [[255, 61], [250, 57], [255, 59]], '#ffb84d');
  }
  // little flags between two poles
  ctx.strokeStyle = '#3c2412';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(150, 128); ctx.lineTo(150, 210); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(240, 128); ctx.lineTo(240, 210); ctx.stroke();
  const flagColors = ['#ff8a5c', '#ffd34d', '#7be495', '#6ec6ff', '#ff8a5c', '#ffd34d'];
  for (let i = 0; i < 6; i++) {
    const x = 156 + i * 14;
    const isDiff = i === 3;
    poly(ctx, [[x, 130], [x + 12, 130], [x + 6, 146]], isDiff && applied.has('bendera') ? '#b06eff' : flagColors[i]);
  }
  // stall 1: sate (sign text is the 'papan' difference)
  drawStall(ctx, 36, 158, 148, ['#e84a5f', '#ffe9a8'], applied.has('papan') ? 'SOTO AYAM' : 'SATE AYAM', (c, x, y) => {
    drawFruitPile(c, x + 40, y - 4, '#e8703a', 8);
    drawFruitPile(c, x + 110, y - 4, '#7be495', 8);
  });
  // stall 2: jamu (awning colour + jar are differences)
  drawStall(ctx, 206, 158, 148, applied.has('tenda') ? ['#ff7eb6', '#ffe9a8'] : ['#2ec4b6', '#ffe9a8'], 'JAMU SEGAR', (c, x, y) => {
    if (!applied.has('guci')) {
      drawJar(c, x + 34, y - 2, '#b06eff');
      drawJar(c, x + 58, y - 2, '#6ec6ff');
      drawJar(c, x + 82, y - 2, '#ff8a5c');
    } else {
      drawJar(c, x + 34, y - 2, '#b06eff');
      drawJar(c, x + 82, y - 2, '#ff8a5c');
    }
    drawFruitPile(c, x + 118, y - 4, '#ffd34d', 4);
  });
  // stall 3: buah (price tag is the 'harga' difference)
  drawStall(ctx, 376, 158, 148, ['#7b5cff', '#ffe9a8'], 'BUAH SEGAR', (c, x, y) => {
    drawFruitPile(c, x + 36, y - 4, '#ff4d6d', 8);
    drawFruitPile(c, x + 96, y - 4, '#ffb84d', 8);
    roundRect(c, x + 66, y - 34, 34, 18, 4, '#fff6c9');
    c.fillStyle = '#7a2d1d';
    c.font = 'bold 11px Trebuchet MS, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(applied.has('harga') ? '7K' : '5K', x + 83, y - 25);
  });
  // cobbled ground
  ctx.fillStyle = '#4a3423';
  ctx.fillRect(0, 330, w, 70);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  for (let i = 0; i < 24; i++) {
    const x = (i * 47) % 560;
    const y = 336 + Math.floor(i / 12) * 26 + (i % 3) * 6;
    ellipse(ctx, x, y, 20, 7, 'rgba(0,0,0,.18)');
  }
  // crate with the cat (tail up in A, down in B)
  rect(ctx, 462, 330, 62, 40, '#8a5a30');
  rect(ctx, 462, 330, 62, 8, '#a8743f');
  ctx.strokeStyle = '#8a5a30';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(470, 334); ctx.lineTo(470, 366); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(516, 334); ctx.lineTo(516, 366); ctx.stroke();
  // cat
  ellipse(ctx, 494, 322, 20, 13, '#ff9a3c');
  circle(ctx, 512, 310, 10, '#ff9a3c');
  poly(ctx, [[505, 303], [507, 293], [512, 301]], '#ff9a3c');
  poly(ctx, [[515, 301], [519, 292], [520, 302]], '#ff9a3c');
  ctx.strokeStyle = '#ff9a3c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (applied.has('kucing')) {
    ctx.moveTo(476, 322);
    ctx.quadraticCurveTo(466, 330, 470, 340);
  } else {
    ctx.moveTo(476, 322);
    ctx.quadraticCurveTo(464, 312, 466, 300);
  }
  ctx.stroke();
  circle(ctx, 515, 309, 1.6, '#241a3a');
  ctx.strokeStyle = '#241a3a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(519, 313); ctx.lineTo(523, 314); ctx.stroke();
  // paper lanterns on the ground
  circle(ctx, 60, 352, 12, '#ff4d6d');
  circle(ctx, 92, 356, 9, '#ffd34d');
  circle(ctx, 330, 356, 10, '#ff8a5c');
}
