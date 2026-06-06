const ACTIONS = {
  1: {
    c: 'rm -rf /home/psmolina/TFM-SIMULATION/build_javascript',
    m: '',
    p: '/home/psmolina/TFM-SIMULATION/project/javascript_component/make_build.sh',
  },
  2: {
    c: 'rm -rf /home/psmolina/TFM-SIMULATION/build_java',
    m: 'cd /home/psmolina/TFM-SIMULATION/project/java_component; javac *.java',
    p: 'cd /home/psmolina/TFM-SIMULATION/project/java_component; mkdir -p build; cp *.class startup.sh build/; tar -cvf build_java.tar build/',
  },
  3: {
    c: 'rm -rf /home/psmolina/TFM-SIMULATION/build_cpp',
    m: 'cd /home/psmolina/TFM-SIMULATION/project/cpp_component; mkdir -p build; g++ main.cpp -o build/main.exe',
    p: 'cp /home/psmolina/TFM-SIMULATION/project/cpp_component/startup.sh /home/psmolina/TFM-SIMULATION/project/cpp_component/build; tar -cvf /home/psmolina/TFM-SIMULATION/project/cpp_component/build_cpp.tar /home/psmolina/TFM-SIMULATION/project/cpp_component/build/',
  },
  4: {
    c: 'rm -rf /home/psmolina/TFM-SIMULATION/build_python',
    m: '',
    p: 'tar -cvf build_python.tar /home/psmolina/TFM-SIMULATION/project/python_component/main.py',
  },
  5: {
    c: 'rm -rf /home/psmolina/TFM-SIMULATION/build_log_component',
    m: 'cd /home/psmolina/TFM-SIMULATION/project/log_component; g++ -Wall -Wextra -Wpedantic -v -save-temps -ftime-report log_main.cpp -o build/log_component.exe > salida.log 2>&1',
    p: 'tar -cvf build_log_component.tar /home/psmolina/TFM-SIMULATION/project/log_component/main.py',
    k: "if [ -f /home/psmolina/TFM-SIMULATION/project/log_component/build/log_component.exe ]; then echo 'Archivo existe'; touch /home/psmolina/TFM-SIMULATION/project/log_component/valid_compilation; else echo 'Archivo no existe'; fi",
  },
  6: {
    c: 'agora.sh -P project -c',
    m: 'cd /home/psmolina/TFM-SIMULATION/project/log_component; g++ -Wall -Wextra -Wpedantic -v -save-temps -ftime-report log_main.cpp -o build/log_component.exe > salida.log 2>&1',
    p: 'tar -cvf build_log_component.tar /home/psmolina/TFM-SIMULATION/project/log_component/main.py',
    k: "if [ -f /home/psmolina/TFM-SIMULATION/project/log_component/build/log_component.exe ]; then echo 'Archivo existe'; touch /home/psmolina/TFM-SIMULATION/project/log_component/valid_compilation; else echo 'Archivo no existe'; fi",
  },
};

const getCommandForAction = (boxId, actionLabel) => {
  const boxActions = ACTIONS[Number(boxId)];
  if (!boxActions) return null;

  const label = String(actionLabel || '').trim();
  if (!label) return null;

  return boxActions[label] ?? null;
};

module.exports = {
  ACTIONS,
  getCommandForAction,
};
