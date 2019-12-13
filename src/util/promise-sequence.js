
// Cache this pre-resolved promise for performance.
const resolved = Promise.resolve(true);

export const promiseSequence = (arr, asyncFunc) => () => arr.reduce((prevPromise, item) => prevPromise.then(() => asyncFunc(item)), resolved);

export default {
  promiseSequence,
};
