export default {
  generateQuestion() {
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    return { text: `${a} + ${b} = `, answer: a + b };
  }
};
