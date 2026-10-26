# Panacea Restaurant — MVP

Base: TastyIgniter 4.x (MIT). La aplicación original conserva pedidos, menús y reservas mediante los módulos instalados por Composer.

## Objetivo

Sistema de gestión para restaurantes que permita operar con datos persistentes, no una simulación estática.

## Alcance del primer MVP

1. Configurar un restaurante y su ubicación, horarios y moneda.
2. Crear categorías y productos de menú con precio y disponibilidad.
3. Recibir pedidos y gestionar estados mediante los módulos nativos.
4. Administrar reservas y mesas cuando estén instaladas las extensiones correspondientes.
5. Crear un panel gerencial con ventas y pedidos reales.
6. Aplicar identidad visual Panacea, español y diseño adaptable.

## Reglas técnicas

- No editar directamente vendor/ ni eliminar el reconocimiento de licencia MIT.
- Usar paquetes/extensiones de TastyIgniter para cambios funcionales.
- No exponer datos de clientes ni credenciales en el repositorio.
- Los pagos, facturación fiscal y mensajería se consideran integraciones separadas, no capacidades verificadas del MVP.

## Validación

Instalar dependencias según la documentación oficial, configurar .env y la base de datos, ejecutar migraciones e instalar el sistema. Probar pedidos y reservas de extremo a extremo antes de publicar una demo comercial.
