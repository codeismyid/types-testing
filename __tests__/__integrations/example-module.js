export default {
  join: (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return `${a}${b}`;
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a + b;
    }
  }
};
