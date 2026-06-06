const { execFile } = require('child_process');
const config = require('../config/app');
const { getCommandForAction } = require('../config/actions');

const executeWhitelistedAction = ({ boxId, actionLabel }) => new Promise((resolve, reject) => {
  const command = getCommandForAction(boxId, actionLabel);

  if (command === null) {
    reject(new Error('Accion no permitida'));
    return;
  }

  if (!command.trim()) {
    resolve({
      stdout: '',
      stderr: '',
      skipped: true,
      reason: 'Accion sin comando asociado',
    });
    return;
  }

  execFile(
    '/bin/bash',
    ['-lc', command],
    {
      timeout: config.commandTimeoutMs,
      maxBuffer: config.commandMaxBufferBytes,
    },
    (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr, skipped: false });
    }
  );
});

module.exports = {
  executeWhitelistedAction,
};
