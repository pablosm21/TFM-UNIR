const fs = require('fs');
const path = require('path');
const config = require('../config/app');

const projectRoot = path.join(config.simulationRoot, 'project');

const componentDirs = {
  1: path.join(projectRoot, 'javascript_component'),
  2: path.join(projectRoot, 'log_component')
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
