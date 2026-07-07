#!/bin/bash
set -eu

PROJECT_ROOT="${CURRENT_PROJECT:-/home/psmolina/TFM-SIMULATION/project}"
COMPONENT_ROOT="${PROJECT_ROOT}/javascript_component"
BUILD_DIR="${COMPONENT_ROOT}/build"

mkdir -p "${BUILD_DIR}"
cp "${COMPONENT_ROOT}/index.js" "${BUILD_DIR}"
cp "${COMPONENT_ROOT}/startup.sh" "${BUILD_DIR}"

tar -czvf "${COMPONENT_ROOT}/javascript_component.tar.gz" -C "${BUILD_DIR}" .
