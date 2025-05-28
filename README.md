# Proyecto PWA Fullstack: Sincronización Offline/Online

## Instrucciones para ejecutar el proyecto localmente

### Requisitos previos
- Node.js 18+ y npm
- Python 3.10+
- SQL Server (puede ser local o en contenedor)

---

### 1. Backend (FastAPI + SQL Server)

1. **Configura SQL Server:**
   - Asegúrate de tener una instancia de SQL Server corriendo.
   - Crea la base de datos usando el script `Baken/BdSQL.sql` si es necesario.
   - Actualiza la cadena de conexión en `Baken/app/core/config.py` según tu entorno.

2. **Instala dependencias:**
   ```powershell
   cd Baken
   pip install -r requirements.txt
   ```

3. **Inicia el backend:**
   ```powershell
   cd app
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   El backend estará disponible en http://localhost:8000

---

### 2. Frontend (Angular)

1. **Instala dependencias:**
   ```powershell
   cd Fronen
   npm install
   ```

2. **Inicia la aplicación Angular:**
  ''ejecutar aplicacion en modo produccion con "ng build --configuration production"
eso soltara una ruta, en esa ruta hay una carpeta que se llama browser, abrimos un cmd desde ahi.
ejecutamos el siguiente comando "browser>http-server -p 8080 --fallback index.html"
se tiene que ver manos menos asi:
C:\Users\heku\Documents\Programacion\Fulestac\Fronen\dist\frontfullstack\browser>http-server -p 8080 --fallback index.html


el servidor estara corriendo en mi caso en http://127.0.0.1:8080

  

---

### Notas
- El frontend y backend deben ejecutarse en paralelo.
- Si usas SQL Server en contenedor, expón el puerto 1433 y ajusta la cadena de conexión.
- El backend permite CORS para desarrollo local.
- Para pruebas de PWA/offline, usa Chrome DevTools > Network > Offline.

---

## Justificación de la elección de tecnologías

- **Angular**: Framework robusto y moderno para el desarrollo de aplicaciones web SPA, con excelente soporte para PWA, reactividad, signals y ecosistema de componentes.
- **FastAPI**: Framework backend en Python, rápido, asíncrono y fácil de usar, ideal para APIs RESTful y con integración sencilla con bases de datos y CORS.
- **SQL Server**: Motor de base de datos confiable y escalable, adecuado para aplicaciones empresariales y con buen soporte en Python vía SQLAlchemy y pyodbc.
- **IndexedDB**: API de almacenamiento local avanzada en el navegador, permite guardar datos estructurados de forma persistente y eficiente, ideal para escenarios offline.
- **Tailwind CSS**: Framework de utilidades CSS para construir interfaces modernas y responsivas de forma rápida.

## Descripción de la implementación de la sincronización offline/online

- **Frontend Angular**:
  - Los datos ingresados por el usuario se almacenan siempre en IndexedDB usando un servicio dedicado.
  - Si hay conexión a internet, los datos offline se sincronizan automáticamente con el backend (FastAPI) usando un endpoint de importación masiva.
  - Cuando el usuario recupera la conexión (evento `online`), se dispara la sincronización automática y la lista se actualiza.
  - El usuario puede eliminar ítems online.
  - Se usan signals y computed para un estado reactivo y eficiente, y ChangeDetectionStrategy.OnPush para optimizar el rendimiento.

- **Backend FastAPI**:
  - Expone endpoints RESTful para crear, listar, importar y eliminar ítems.
  - El endpoint `/import` permite recibir múltiples ítems y guardarlos en la base de datos de forma eficiente.
  - El backend maneja correctamente CORS para permitir peticiones desde el frontend.

## Detalles técnicos relevantes

- **Almacenamiento local (IndexedDB)**:
  - Se utiliza la librería `idb` para facilitar el acceso a IndexedDB desde Angular.
  - Los datos se guardan con un esquema simple (id, title, description, synced).
  - Al sincronizar, los datos se envían al backend y, si la operación es exitosa, se eliminan del almacenamiento local.

- **Políticas de reintento y manejo de errores**:
  - Si la sincronización falla (por ejemplo, el backend está caído), los datos permanecen en IndexedDB y se reintenta automáticamente al recuperar la conexión.
  - Se muestran popups visuales para informar al usuario sobre el éxito o error en las operaciones de guardado, sincronización y eliminación.
  - El frontend valida los campos antes de guardar y muestra mensajes claros si hay errores de validación.

- **Sincronización eficiente**:
  - La lógica evita dobles envíos al backend usando flags y control de eventos.
  - La paginación y la visualización de la lista de ítems son reactivas y eficientes gracias a signals y computed.

- **UI/UX**:
  - Se utiliza Tailwind CSS para un diseño moderno, responsivo y accesible.
  - Los popups y botones tienen animaciones y estilos claros para mejorar la experiencia de usuario.

## Diagrama de arquitectura: Flujo de sincronización de datos

**Explicación:**
- Los datos siempre se almacenan primero en IndexedDB.
- Si hay conexión, se sincronizan automáticamente con el backend (FastAPI).
- Si no hay conexión, quedan en IndexedDB y se reintenta al recuperar la conexión.
- Las eliminaciones se reflejan tanto en backend como en IndexedDB.
- El backend persiste los datos en SQL Server y responde al frontend para limpiar los datos locales sincronizados.

---

Este proyecto demuestra una arquitectura robusta para aplicaciones PWA con sincronización offline/online, manejo eficiente de datos locales y remotos, y una experiencia de usuario moderna y fluida.
