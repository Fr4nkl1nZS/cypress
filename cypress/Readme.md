# 🚀 Framework de Automatización Vueling con Cypress

**Autor**: Franklin González  
**Email**: apostolfranklin1@gmail.com  
**Versión**: 1.0.0  

## 📌 Descripción
Framework de pruebas E2E para el flujo de alquiler de coches en Vueling. Incluye:
- ✅ Pruebas cross-browser (Chrome, Firefox)
- ✅ Gestión avanzada de cookies y trackers
- ✅ Patrón Page Object Model
- ✅ Reportería HTML integrada

## 🛠 Instalación
1. Clona el repositorio:
   ```bash
   git clone https://dev.azure.com/apostolfranklin1/apostolfranklin1/_git/apostolfranklin1
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```

## 🚦 Ejecución 
- **Modo interactivo**:
  ```bash
  npm run cy:open
  ```
- **Chrome (headless)**:
  ```bash
  npm run cy:run-chrome
  ```
- **Firefox**:
  ```bash
  npm run cy:run-firefox
  ```

## 🗂 Estructura del Proyecto
```
cypress/
├── e2e/                  # Casos de prueba
├── fixtures/             # Datos de prueba (ej: carRental.json)
├── pages/                # Page Objects (HomePage.js, CarRentalPage.js)
└── support/              # Comandos personalizados
```

## 🧩 Comandos Personalizados
| Comando | Descripción |
|---------|-------------|
| `cy.forceCleanCookies()` | Limpieza profunda de cookies |
| `cy.blockTrackingRequests()` | Bloquea dominios de tracking |
| `cy.retryOperation()` | Reintento automático de operaciones fallidas |

## ⚙️ Configuración
Parámetros clave en `cypress.config.js`:
```javascript
baseUrl: "https://cars.vueling.com",
defaultCommandTimeout: 40000,
chromeWebSecurity: false  // Permite testing en iframes
```

## 📊 Reportes
Se genera automáticamente un reporte HTML en:
```
cypress/reports/html/index.html
```

## 🐛 Solución de Problemas
- **Error "Cookies no se limpian"**:
  Ejecuta `cy.task('clearHardcodedCookies')` manualmente.
- **Fallos en Firefox**:
  Verifica la versión del navegador (soportada: 116+).

## 🤝 Contribución
1. Haz fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Add feature'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---
*Última actualización: Agosto 2025*