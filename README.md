# Recauda - Offline-First Mobile Application

Plataforma móvil y backend diseñada para digitalizar el control de donaciones y el trabajo de campo de voluntarios. Implementa sincronización local de datos para operar en zonas sin cobertura de internet y despliegues automáticos por el aire (OTA).

**Arquitectura:** Frontend en React Native (Expo) + Backend API REST en Node.js (Express) + Base de datos PostgreSQL alojada en Neon.

<p align="center">
  <img src="frontend-app/assets/login.jpg" width="250" alt="Pantalla de Login">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="frontend-app/assets/menu.jpg" width="250" alt="Menú Principal">
</p>

### Pruébala en tu dispositivo
[![Descargar APK](https://img.shields.io/badge/Descargar-APK_Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Carlos29Guardado/recauda-app/releases/latest)

---

## Estructura del Proyecto

```text
.
├── backend-alcancias/               # API REST (Node.js, Express, pg)
├── frontend-app/              # App Móvil (React Native, Expo, AsyncStorage)
├── .gitignore
└── README.md
```
## Características Principales
* **Offline-First**: Gestión de sesiones persistentes y almacenamiento local mediante AsyncStorage para operar sin conexión.

* **Over-The-Air (OTA) Updates**: Integración con expo-updates para enviar parches y nuevas interfaces en segundos sin requerir una reinstalación del archivo APK.

* **Búsqueda en Tiempo Real:** Filtrado dinámico de registros y comunidades directamente en la interfaz móvil.

* **Base de Datos en la Nube:** Esquema relacional optimizado en PostgreSQL a través de Neon.

## Requisitos Previos
* Node.js 18 o superior y npm.

* Cuenta en Neon.tech para la base de datos PostgreSQL.

* Cuenta en Expo configurada para despliegues EAS.

* Aplicación Expo Go instalada en tu dispositivo móvil (para pruebas locales).

## Variables de Entorno
### Backend — backend-alcancias/.env
```
PORT=3000
DATABASE_URL=postgresql://usuario:password@ep-midatabase.us-east-2.aws.neon.tech/neondb?sslmode=require
GOOGLE_CLIENTE_ID=tu_google_client_id
GOOGLE_ANDROID_CLIENT_ID=tu_google_android_client_id
JWT_SECRET=tu_clave_secreta_jwt
```
### Frontend — frontend-app/.env
```
webClientId=tu_web_client_id.apps.googleusercontent.com
```
> **Nota:** Para pruebas locales en un dispositivo físico, asegúrate de que la IP corresponda a tu máquina en la red local, no a `localhost`.

## Base de Datos (PostgreSQL & Neon)

El sistema utiliza una base de datos relacional en PostgreSQL alojada en [Neon.tech](https://neon.tech/), aprovechando su arquitectura *serverless* para escalar según la demanda de los voluntarios en campo.

### Esquema Principal
El modelo de datos está optimizado para garantizar la integridad de las donaciones y el control de los usuarios:
* **Usuarios:** Gestión de credenciales, sesiones y control de acceso.
* **Alcancías:** Registro de los contenedores de donación, vinculados a códigos únicos, responsables y montos.
* **Comunidades:** Catálogo de las zonas geográficas asignadas para la recolección.
```mermaid
erDiagram
    USUARIOS {
        int id PK
        string nombre
        string email
        string password
        int comunidad_id
    }
    COMUNIDADES {
        int id PK
        string nombre
        string codigo_invitacion
        time fecha_creacion
        int rango_inicio
        int rango_final
    }
    ALCANCIAS {
        int id PK
        int codigo_alcancia
        int nombre_persona
        boolean colocada
        boolean devuelta
        boolean faltante
        float monto_entregado
        int anio
        int usuario_id FK
        int comunidad_id FK
    }

    USUARIOS ||--o{ ALCANCIAS : gestiona
    COMUNIDADES ||--o{ ALCANCIAS : "tiene asignadas"
```
## Instalación y Ejecución Local
### 1.Levantar el Backend
Abre una terminal, instala las dependencias y corre el servidor de desarrollo:
```
cd backend-alcancias
npm install
npm run dev 
```
>  El servidor estará escuchando en el puerto configurado `(ej. http://localhost:3000).`

### 2.Levantar el Frontend (App Móvil)
Abre una segunda terminal, instala las dependencias y arranca el empaquetador de Expo:
```
cd frontend-app
npm install
npx expo start
```
> Escanea el código QR que aparece en la terminal usando Expo Go en tu dispositivo Android o la cámara en iOS.
## Scripts de Ejecución

### Scripts del Backend
| Script | Descripción |
| -------| ----------- |
| npm run dev | Inicia el servidor de desarrollo con auto-recargar (nodemon) |
| npm start | Ejecuta el servidor para el entorno de producción |

### Scripts de Frontend
| Script | Descripción |
| -------| ----------- |
| npx expo start | Levanta el servidor de desarrollo local de Expo |
| npx expo start -c | Limpia la caché de Expo y levanta el servidor |
| eas build -p android | Compila el archivo APK/AAB para producción en la nube |

## Actualizaciones Over-The-Air (OTA)
El proyecto está configurado para enviar actualizaciones directas a los dispositivos sin pasar por las tiendas de aplicaciones. Para enviar un parche visual o lógico:
### Desde la carpeta frontend/
```
eas update --branch preview --message "Descripción de los cambios, ej: Agregado buscador en lista
```
