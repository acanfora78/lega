// Generatore pseudo-casuale deterministico (mulberry32) — garantisce che i
// dati "demo" siano stabili tra un render e l'altro e tra server/client.

export function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return h;
}

export function seededRandom(key: string) {
  return mulberry32(hashSeed(key));
}

export function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickMany<T>(rand: () => number, arr: T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function randInt(rand: () => number, min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
