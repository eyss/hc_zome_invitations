export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(() => resolve(null), ms));
