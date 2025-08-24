import { math } from "../common.js";

export default {
  generateQuestion() {
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    return { text: `GCF(${a}, ${b}) = `, answer: math.gcd(a, b) };
  }
};
