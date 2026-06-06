const config = require('./app');

const currentProject = config.currentProject;

const allowedCommands = {
  1: {
    c: `rm -rf ${currentProject}/javascript_component/build`,
    m: '',
    p: `cd ${currentProject}/javascript_component; ./make_build.sh`,
  },
  2: {
    c: `rm -rf ${currentProject}/java_component/build`,
    m: `cd ${currentProject}/java_component;javac *.java`,
    p: `cd ${currentProject}/java_component;mkdir build;mv *.class startup.sh build/;tar -cvf build_java.tar build/`,
  },
  3: {
    c: `rm -rf ${currentProject}/cpp_component/build ${currentProject}/cpp_component/build_cpp.tar`,
    m: `cd ${currentProject}/cpp_component ;mkdir build ; g++ main.cpp -o build/main.exe`,
    p: `cp ${currentProject}/cpp_component/startup.sh ${currentProject}/cpp_component/build ; tar -cvf ${currentProject}/cpp_component/build_cpp.tar -C ${currentProject}/cpp_component build`,
  },
  4: {
    c: `rm -rf ${currentProject}/python_component/build_python ${currentProject}/python_component/build_python.tar`,
    m: '',
    p: `tar -cvf ${currentProject}/python_component/build_python.tar -C ${currentProject}/python_component main.py`,
  },
  5: {
    c: `rm -rf ${currentProject}/log_component/build; rm -f ${currentProject}/log_component/build_log_component.tar`,
    m: `mkdir ${currentProject}/log_component/build; cd ${currentProject}/log_component;g++ -Wall -Wextra -Wpedantic -v -save-temps -ftime-report log_main.cpp -o build/log_component.exe > salida.log 2>&1`,
    p: `tar -cvf ${currentProject}/log_component/build_log_component.tar -C ${currentProject}/log_component/build log_component.exe ${currentProject}/log_component/startup.sh`,
    k: `if [ -f ${currentProject}/log_component/build/log_component.exe ]; then echo 'Archivo existe';touch ${currentProject}/log_component/valid_compilation; else echo 'Archivo no existe'; fi`,
  },
  6: {
    c: 'agora.sh -P project -c',
    m: `cd ${currentProject}/fdp_component;g++ -Wall -Wextra -Wpedantic -v -save-temps -ftime-report fdp_main.cpp -o build/fdp.exe > salida.log 2>&1`,
    p: `tar -cvf build_fdp.tar ${currentProject}/fdp_component/main.py`,
    k: `if [ -f ${currentProject}/fdp_component/build/fdp.exe ]; then echo 'Archivo existe';touch ${currentProject}/fdp_component/valid_compilation; else echo 'Archivo no existe'; fi`,
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
