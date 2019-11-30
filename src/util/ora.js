import 'colors';
import debug from 'debug';
import logSymbols from 'log-symbols';
import realOra from 'ora';

const d = debug('@lanethegreat/electron-forge:lifecycle');

const useFakeOra = (process.env.DEBUG && process.env.DEBUG.includes('@lanethegreat/electron-forge'));

if (useFakeOra) {
  console.warn('WARNING: DEBUG environment variable detected.  Progress indicators will be sent over @lanethegreat/electron-forge:lifecycle'.red);
}

export const fakeOra = (name) => {
  const fake = {
    start: () => {
      d('Process Started:', name);
      return fake;
    },
    warn: (msg) => {
      console.warn(logSymbols.warning, msg.yellow);
    },
    fail: () => {
      d(`Process Failed: ${name}`.red);
      return fake;
    },
    succeed: () => {
      d('Process Succeeded:', name);
      return fake;
    },
    stop: () => {
      d('Process Stopped:', name);
      return fake;
    },
  };
  return fake;
};

export default useFakeOra ? fakeOra : realOra;
