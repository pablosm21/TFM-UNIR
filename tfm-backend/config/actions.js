const config = require('./app');

const currentProject = config.currentProject;

const allowedCommands = {
  1: {
    c: `rm -rf ${currentProject}/javascript_component/build`,
    m: '',
    p: `cd ${currentProject}/javascript_component; ./make_build.sh`,
  },
  2: {
    c: `mv ${currentProject}/log_component/salida.log ${currentProject}/log_component/salida_$(date '+%Y_%m_%dH%H_%M_%S').log; rm ${currentProject}/log_component/valid_compilation;rm -rf ${currentProject}/log_component/build; rm -f ${currentProject}/log_component/build_log_component.tar`,
    m: `mkdir ${currentProject}/log_component/build; cd ${currentProject}/log_component;g++ -Wall -Wextra -Wpedantic -v -save-temps -ftime-report log_main.cpp -o build/log_component.exe > ${currentProject}/log_component/salida.log 2>&1`,
    p: `tar -cvf ${currentProject}/log_component/build_log_component.tar -C ${currentProject}/log_component/build log_component.exe ${currentProject}/log_component/startup.sh`,
    k: `if [ -f ${currentProject}/log_component/build/log_component.exe ]; then echo 'Archivo existe';touch ${currentProject}/log_component/valid_compilation; else echo 'Archivo no existe'; fi`,
  },
};

const isWhitelistedCommand = (boxId, actionLabel, command) => {
  const boxWhitelist = allowedCommands[Number(boxId)];
  if (!boxWhitelist) return false;

  const label = String(actionLabel || '').trim();
  if (!label) return false;

  return boxWhitelist[label] === command;
};

const ACTIONS = allowedCommands;

const getCommandForAction = (boxId, actionLabel) => {
  const boxActions = ACTIONS[Number(boxId)];
  if (!boxActions) return null;

  const label = String(actionLabel || '').trim();
  if (!label) return null;

  const command = boxActions[label] ?? null;
  if (command === null) return null;

  return isWhitelistedCommand(boxId, label, command) ? command : null;
};

module.exports = {
  ACTIONS,
  getCommandForAction,
};
