const fs = require('fs');
const path = require('path');

const componentDirs = {
  1: '/home/psmolina/TFM-SIMULATION/project/javascript_component',
  2: '/home/psmolina/TFM-SIMULATION/project/java_component',
  3: '/home/psmolina/TFM-SIMULATION/project/cpp_component',
  4: '/home/psmolina/TFM-SIMULATION/project/python_component',
  5: '/home/psmolina/TFM-SIMULATION/project/log_component',
  6: '/home/psmolina/TFM-SIMULATION/project/log_component',
};

const getBoxColor = (salidaOutExists, validCompilationExists) => {
  if (!salidaOutExists && !validCompilationExists) return 'white';
  if (salidaOutExists && !validCompilationExists) return 'red';
  if (salidaOutExists && validCompilationExists) return 'green';
  return 'yellow';
};

const buildStatuses = () => Object.entries(componentDirs).map(([id, dir]) => {
  const salidaOutPath = path.join(dir, 'salida.log');
  const validCompilationPath = path.join(dir, 'valid_compilation');

  const salidaOutExists = fs.existsSync(salidaOutPath);
  const validCompilationExists = fs.existsSync(validCompilationPath);

  return {
    id: Number(id),
    salidaOutExists,
    validCompilationExists,
    color: getBoxColor(salidaOutExists, validCompilationExists),
    salidaOutPath,
    validCompilationPath,
  };
});

module.exports = {
  componentDirs,
  getBoxColor,
  buildStatuses,
};
