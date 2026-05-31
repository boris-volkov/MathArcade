export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

export function ri(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function simplifyFrac(n, d) {
  const g = gcd(Math.abs(n), Math.abs(d));
  return { n: n / g, d: d / g };
}
