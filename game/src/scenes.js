// Kembar Beda: scene data. Every scene is 560x400 panel space and hides exactly
// 10 differences. A difference is a spot: x, y, the click radius r, a short
// Indonesian label shown when it is found, and a hint line for the hint button.
export const PANEL_W = 560;
export const PANEL_H = 400;

export const DIFFICULTIES = {
  santai: { id: 'santai', name: 'Santai', seconds: 300 },
  klasik: { id: 'klasik', name: 'Klasik', seconds: 180 },
  kilat: { id: 'kilat', name: 'Kilat', seconds: 90 },
};

export const SCENES = [
  {
    id: 'pasar',
    name: 'Pasar Malam',
    emoji: '\u{1F3EE}',
    sub: 'Lampion, sate, dan kucing oren',
    tagline: 'Pasar malam di tepi kota: lampion menyala, asap sate mengepul.',
    painter: 'market',
    diffs: [
      { id: 'lampion', x: 140, y: 84, r: 16, label: 'Lampion berubah warna', hint: 'Lihat deretan lampion di atas, ada satu yang warnanya lain.' },
      { id: 'bintang', x: 302, y: 42, r: 12, label: 'Satu bintang hilang', hint: 'Hitung bintang di langit kiri atas.' },
      { id: 'bulan', x: 472, y: 56, r: 26, label: 'Bulan jadi sabit', hint: 'Bulannya tidak bulat penuh di satu gambar.' },
      { id: 'tenda', x: 280, y: 196, r: 20, label: 'Warna tenda berubah', hint: 'Tenda kios tengah belangnya beda warna.' },
      { id: 'guci', x: 322, y: 268, r: 14, label: 'Satu guci hilang', hint: 'Rak kios tengah: hitung gucinya.' },
      { id: 'papan', x: 110, y: 168, r: 22, label: 'Tulisan papan berubah', hint: 'Baca papan nama kios pertama baik-baik.' },
      { id: 'harga', x: 448, y: 300, r: 14, label: 'Harga berubah', hint: 'Label harga di kios kanan angkanya beda.' },
      { id: 'kucing', x: 498, y: 318, r: 18, label: 'Ekor kucing berubah', hint: 'Kucing di atas peti: ekornya naik atau turun?' },
      { id: 'burung', x: 252, y: 68, r: 12, label: 'Burung tambahan', hint: 'Ada burung hinggap di kabel lampu.' },
      { id: 'bendera', x: 196, y: 128, r: 14, label: 'Bendera berubah warna', hint: 'Deretan bendera kecil di antara tiang.' },
    ],
  },
  {
    id: 'karang',
    name: 'Terumbu Karang',
    emoji: '\u{1F420}',
    sub: 'Ikan, penyu, dan harta karun',
    tagline: 'Di bawah laut yang tenang, karang warna-warni menyembunyikan rahasia.',
    painter: 'reef',
    diffs: [
      { id: 'ikan', x: 282, y: 168, r: 22, label: 'Ikan berubah warna', hint: 'Ikan besar di tengah warnanya lain.' },
      { id: 'kawanan', x: 96, y: 118, r: 14, label: 'Satu ikan hilang', hint: 'Kawanan ikan kecil di kiri: ada yang kurang satu.' },
      { id: 'karang', x: 452, y: 300, r: 24, label: 'Karang berubah warna', hint: 'Karang kipas di kanan bawah warnanya beda.' },
      { id: 'penyu', x: 402, y: 182, r: 22, label: 'Sirip penyu berubah', hint: 'Penyu berenang: satu siripnya terangkat.' },
      { id: 'bintanglaut', x: 168, y: 356, r: 16, label: 'Bintang laut hilang', hint: 'Dasar pasir kiri: ada bintang laut yang lenyap.' },
      { id: 'kerang', x: 512, y: 352, r: 16, label: 'Kerang membuka', hint: 'Kerang di kanan bawah: terbuka atau tertutup?' },
      { id: 'rumput', x: 52, y: 268, r: 18, label: 'Rumput laut memendek', hint: 'Rumput laut di kiri: yang paling tinggi jadi pendek.' },
      { id: 'gelembung', x: 356, y: 138, r: 16, label: 'Gelembung tambahan', hint: 'Dekat penyu ada gelembung yang tidak ada sebelumnya.' },
      { id: 'permata', x: 118, y: 330, r: 14, label: 'Permata berubah warna', hint: 'Peti harta karun: permata di atasnya beda warna.' },
      { id: 'ubur', x: 470, y: 92, r: 20, label: 'Ubur-ubur hilang', hint: 'Ubur-ubur di kanan atas melayang ke mana?' },
    ],
  },
  {
    id: 'observatorium',
    name: 'Observatorium Gunung',
    emoji: '\u{1F52D}',
    sub: 'Kubah, teleskop, dan burung hantu',
    tagline: 'Di puncak bersalju, kubah putih mengintip langit malam.',
    painter: 'observatory',
    diffs: [
      { id: 'bulan', x: 478, y: 58, r: 24, label: 'Kawah bulan bertambah', hint: 'Bulan di kanan atas: hitung kawahnya.' },
      { id: 'komet', x: 150, y: 62, r: 20, label: 'Komet menghilang', hint: 'Ada komet melintas di langit kiri.' },
      { id: 'salju', x: 356, y: 132, r: 20, label: 'Salju puncak hilang', hint: 'Puncak gunung tengah: tutup saljunya lenyap.' },
      { id: 'teleskop', x: 208, y: 148, r: 18, label: 'Teleskop menunduk', hint: 'Teleskop di kubah: arahnya berubah.' },
      { id: 'lampu', x: 196, y: 108, r: 10, label: 'Lampu kubah padam', hint: 'Puncak kubah: lampu merah kecilnya mati.' },
      { id: 'bendera', x: 196, y: 88, r: 12, label: 'Bendera berbalik arah', hint: 'Bendera di atas kubah berkibar ke arah lain.' },
      { id: 'jendela', x: 452, y: 292, r: 14, label: 'Satu jendela gelap', hint: 'Pondok di kanan: satu jendelanya tidak menyala.' },
      { id: 'pinus', x: 88, y: 302, r: 18, label: 'Pohon pinus tambahan', hint: 'Lereng kiri bawah: ada pinus yang tumbuh tiba-tiba.' },
      { id: 'hantu', x: 326, y: 238, r: 14, label: 'Mata burung hantu tertutup', hint: 'Burung hantu di dahan: matanya terpejam.' },
      { id: 'lentera', x: 386, y: 330, r: 12, label: 'Lentera berubah warna', hint: 'Lentera di jalan setapak: cahayanya beda warna.' },
    ],
  },
];
