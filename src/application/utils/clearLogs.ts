import * as fs from 'fs';
import path from 'node:path';

const logsDir = path.resolve('public', 'logs');

export const clearLogs = async (): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    fs.readdir(logsDir, (err, files) => {
      if (err) throw err;

      const fr: Promise<string>[] = [];

      for (const file of files) {
        if (file.endsWith('.txt')) {
          const frp = new Promise<string>((res, rej) => {
            fs.unlink(`${logsDir}/${file}`, (err) => {
              if (err) {
                rej(err);
              } else {
                res(file);
              }
              console.log(`${file} deleted`);
            });
          });
          fr.push(frp);
        }
      }

      Promise.allSettled(fr)
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};
