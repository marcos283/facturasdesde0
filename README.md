# Capturador de Facturas

Una aplicación web sencilla que permite capturar fotos de facturas con la cámara del dispositivo, extraer automáticamente los datos principales usando OCR, y guardarlos en Google Sheets.

## Características

- 📸 **Captura de fotos**: Utiliza la cámara del dispositivo para fotografiar facturas
- 🔍 **OCR automático**: Extrae texto de las facturas usando Tesseract.js
- ✏️ **Edición manual**: Permite revisar y corregir los datos extraídos
- 📊 **Google Sheets**: Guarda automáticamente los datos en una hoja de cálculo
- 📱 **Responsive**: Funciona en dispositivos móviles y desktop

## Datos que extrae

- Fecha de la factura
- Nombre de la empresa/proveedor  
- Número de factura
- Total/importe
- Concepto/descripción

## Configuración de Google Sheets

### 1. Crear una Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. En la primera fila, añade estos encabezados:
   - A1: "Timestamp"
   - B1: "Fecha"
   - C1: "Empresa"
   - D1: "Número Factura"
   - E1: "Total"
   - F1: "Concepto"

### 2. Obtener el ID de la hoja

En la URL de tu Google Sheet, copia el ID:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
```

### 3. Obtener API Key de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets
4. Crea credenciales → API Key
5. Configura las restricciones de la API key para mayor seguridad

### 4. Hacer pública la hoja (opción simple)

Para uso básico, puedes hacer la hoja pública:
1. Clic en "Compartir" en Google Sheets
2. Cambiar a "Cualquier persona con el enlace puede editar"

### 5. Configurar la aplicación

En el archivo `script.js`, reemplaza:
```javascript
const SHEET_ID = 'TU_SHEET_ID_AQUI';
const API_KEY = 'TU_API_KEY_AQUI';
```

## Uso

1. Abre `index.html` en tu navegador
2. Haz clic en "Iniciar Cámara" y permite el acceso
3. Enfoca la factura y haz clic en "Capturar Foto"
4. Revisa la imagen y haz clic en "Procesar Factura"
5. Espera a que el OCR extraiga los datos
6. Revisa y edita los datos si es necesario
7. Haz clic en "Guardar en Google Sheets"

## Tecnologías utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3**: Estilos responsive
- **JavaScript**: Lógica de la aplicación
- **Tesseract.js**: OCR para extraer texto de imágenes
- **MediaDevices API**: Acceso a la cámara
- **Google Sheets API**: Almacenamiento de datos

## Archivos del proyecto

```
facturasdesde0/
├── index.html          # Página principal
├── script.js           # Lógica de la aplicación
├── styles.css          # Estilos CSS
└── README.md           # Documentación
```

## Compatibilidad

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Dispositivos móviles (Android/iOS)

## Limitaciones

- Requiere conexión a internet para el OCR y Google Sheets
- La calidad del OCR depende de la claridad de la imagen
- Necesita permisos de cámara del navegador

## Mejoras futuras

- Soporte para múltiples idiomas en OCR
- Almacenamiento local temporal
- Exportación a otros formatos (CSV, PDF)
- Mejor detección automática de campos
- Autenticación OAuth para Google Sheets

## Notas de seguridad

- No hardcodees API keys en producción
- Usa variables de entorno para credenciales
- Considera implementar autenticación OAuth
- Restringe las API keys por dominio