#include <iostream>
#include <thread>
#include <chrono>

void log(const std::string& level, const std::string& msg) {
    std::cout << "[" << level << "] " << msg << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
}

int main() {
    log("INFO", "Iniciando log_component...");
    log("DEBUG", "Verificando dependencias...");
    log("DEBUG", "Dependencia A encontrada");
    log("DEBUG", "Dependencia B encontrada");
    log("INFO", "Compilando modulo log...");
    log("DEBUG", "Preprocesando log_main.cpp");
    log("DEBUG", "Compilando log_main.cpp");
    log("DEBUG", "Generando objeto log_main.obj");
    log("INFO", "Enlazando objetos...");
    log("DEBUG", "Enlazando log_main.obj");
    log("INFO", "Generando ejecutable log_component.exe");
    log("DEBUG", "Ejecutable generado en build/log_component.exe");
    log("INFO", "Compilación finalizada con éxito.");
    log("WARNING", "Este es un mensaje de advertencia de ejemplo");
    log("ERROR", "Este es un mensaje de error de ejemplo (simulado)");
    return 0;
}
