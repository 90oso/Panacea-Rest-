# Panacea Restaurant — desarrollo local
Desde la raíz del repositorio en CMD de Windows:

```bat
docker compose -f compose.panacea.yml up -d --build
docker compose -f compose.panacea.yml exec app composer install
copy .env.example .env
```

Configura el archivo .env: APP_NAME="Panacea Restaurant", APP_ENV=local, APP_DEBUG=true, APP_URL=http://localhost:8088, DB_CONNECTION=mysql, DB_HOST=db, DB_PORT=3306, DB_DATABASE=panacea, DB_USERNAME=panacea, DB_PASSWORD=panacea_local_dev. Usa estas contraseñas solamente en desarrollo local.

Luego ejecuta `docker compose -f compose.panacea.yml exec app php artisan key:generate`. Sigue el instalador de TastyIgniter según la versión instalada; no ejecutes migraciones a ciegas. La web local será http://localhost:8088. No publiques este entorno a Internet.
