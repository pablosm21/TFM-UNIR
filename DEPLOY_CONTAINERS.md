# Deploy de TFM-UNIR con contenedores

Este despliegue levanta:
- `simulation` (inicializa el volumen compartido con el contenido de TFM-SIMULATION)
- `mysql` (base de datos)
- `backend` (API + Socket.IO)
- `frontend` (build React servido por Nginx)

## 1. Requisitos

- Docker
- Docker Compose (`docker compose`)

## 2. Preparar variables

1. Copia la plantilla:

```bash
cp .env.docker.example .env.docker
```

2. Ajusta al menos:
- `JWT_SECRET`
- `SIMULATION_HOST_PATH`
- `CURRENT_PROJECT`

`SIMULATION_HOST_PATH` debe apuntar al proyecto de simulacion en tu host (por ejemplo `/home/psmolina/TFM-SIMULATION`).
`CURRENT_PROJECT` debe apuntar al root del proyecto dentro del contenedor backend. Con el despliegue actual, usa `/simulation/project`.

## 3. Levantar todo

```bash
docker compose --env-file .env.docker up -d --build
```

## 4. URLs

- Frontend: http://localhost:8080
- Backend: http://localhost:3001
- Health backend: http://localhost:3001/api/health
- MySQL: localhost:3306

## 5. Parar y borrar

```bash
docker compose --env-file .env.docker down
```

Para borrar tambien el volumen de base de datos:

```bash
docker compose --env-file .env.docker down -v
```

## 6. Logs utiles

```bash
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker logs -f frontend
docker compose --env-file .env.docker logs -f mysql
```

## Notas importantes

- El backend usa `SIMULATION_ROOT=/simulation` dentro del contenedor.
- Esa ruta se alimenta con el volumen Docker `simulation_data`.
- El servicio `simulation` copia el contenido de `SIMULATION_HOST_PATH` al volumen la primera vez que arranca.
- `CURRENT_PROJECT` es la variable que usa `actions.js` para resolver los comandos leidos de `boxes.json`.
- Las acciones permitidas siguen pasando por allowlist (`boxId` + `actionLabel`).
- Si despliegas en otro host o dominio, ajusta:
  - `CORS_ORIGINS` y `SOCKET_CORS_ORIGINS` en `docker-compose.yml`
  - `REACT_APP_API_BASE_URL` y `REACT_APP_SOCKET_URL` en `.env.docker`
