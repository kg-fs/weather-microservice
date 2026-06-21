# Weather Microservice

Este es el microservicio de clima para el sistema de consulta de hora y temperatura. Se encarga de obtener la temperatura de un país o ciudad seleccionado, así como la temperatura de Nicaragua para realizar comparaciones.

El proyecto está construido usando **Node.js**, **Express.js** y **CORS**.

---

## Características

- **Fallback de datos simulados**: Si no has configurado tu clave API Key de WeatherAPI.com, el microservicio generará datos de clima realistas de forma automática para que puedas probar el sistema de inmediato.
- **Consultas en paralelo**: Realiza las peticiones de clima del país seleccionado y de Nicaragua de forma asíncrona y paralela para minimizar los tiempos de respuesta.
- **Middleware de registro básico**: Muestra por consola las solicitudes entrantes con su respectiva marca de tiempo.
- **Manejo de errores global**: Respuestas JSON consistentes ante errores o parámetros inválidos.

---

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

---

## Configuración y Arranque

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar la API Key**:
   Abre [server.js](file:///c:/Users/98272/weather-microservice/server.js) y edita la constante `WEATHER_API_KEY`:
   ```javascript
   const WEATHER_API_KEY = "TU_WEATHER_API_KEY_AQUI"; // Reemplaza por tu API Key real
   ```
   *Nota: Si dejas la constante con el valor por defecto `"TU_WEATHER_API_KEY_AQUI"` o vacía, el microservicio funcionará usando datos ficticios (simulados) basados en un algoritmo determinista para el nombre del país.*

3. **Iniciar el servidor en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Iniciar el servidor en producción**:
   ```bash
   npm start
   ```

---

## Endpoints de la API

### 1. Estado del Microservicio (`GET /health`)
Verifica que el servicio esté activo y funcionando, mostrando el origen de los datos de clima (API Real o Simulador).

* **URL**: `http://localhost:3001/health`
* **Respuesta de ejemplo**:
  ```json
  {
    "status": "UP",
    "service": "weather-microservice",
    "timestamp": "2026-06-21T19:15:47.807Z",
    "weatherSource": "Mock Fallback (No API Key)"
  }
  ```

### 2. Obtener Clima (`GET /api/weather`)
Obtiene la temperatura y condiciones climáticas del país seleccionado y de Nicaragua.

* **URL**: `http://localhost:3001/api/weather?country=Mexico`
* **Parámetros**:
  - `country` (Requerido): Nombre del país o ciudad de consulta.
* **Respuesta de ejemplo**:
  ```json
  {
    "requestedCountry": {
      "name": "Mexico",
      "temp_c": 19,
      "condition": "Overcast",
      "isMock": true
    },
    "nicaragua": {
      "name": "Nicaragua",
      "temp_c": 19,
      "condition": "Sunny",
      "isMock": true
    }
  }
  ```