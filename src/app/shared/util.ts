export const randInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shuffle = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    const ip = array[i];
    array[i] = array[j];
    array[j] = ip;
  }
  return array;
};
