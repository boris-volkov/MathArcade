import { math } from "../common.js";

export default {
  title: "LCM Practice",
  generateQuestion() {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    return { text: `LCM(${a}, ${b}) = ?`, answer: math.lcm(a, b) };
  }
};
