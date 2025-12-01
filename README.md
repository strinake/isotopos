# Liga Fútbol Sala - Isótopos Guadaira

Aplicación web frontend para gestionar y visualizar datos de una liga de fútbol sala, con especial énfasis en el equipo **Isótopos Guadaira**.

## 🚀 Cómo usar

### Abrir la aplicación

Tienes dos opciones:

**Opción 1: Abrir directamente (simple)**  
- Abre el archivo `index.html` directamente en tu navegador (doble clic).  
- Esta opción funciona porque los datos están **embebidos dentro del propio HTML** como JSON.

**Opción 2: Usar un servidor local** (recomendado si más adelante vuelves a usar `fetch` o APIs externas)
```bash
# Si tienes Python 3 instalado
python -m http.server 8000

# Si tienes Node.js instalado
npx serve

# Si tienes PHP instalado
php -S localhost:8000
```

Luego abre tu navegador en `http://localhost:8000`

## 📊 Gestionar datos

Actualmente **todos los datos de la liga están embebidos en `index.html`** dentro de un bloque `<script>` con el id `data-json`.

```html
<script id="data-json" type="application/json">
{
  "teams": [ ... ],
  "matches": [ ... ],
  "scorers": [ ... ],
  "mvp": [ ... ]
}
</script>
```

Para actualizar la información solo tienes que editar ese JSON en `index.html` (respetando la estructura) y recargar la página.

### Estructura del bloque JSON (`script#data-json`)

#### Equipos
```json
{
  "teams": [
    {
      "id": "isotopos",          // ID único del equipo (sin espacios)
      "name": "Isótopos Guadaira", // Nombre completo
      "shortName": "Isótopos"     // Nombre corto (opcional)
    }
  ]
}
```

#### Partidos
```json
{
  "matches": [
    {
      "id": "m1",              // ID único del partido
      "jornada": 1,            // Número de jornada
      "homeTeamId": "isotopos", // ID del equipo local
      "awayTeamId": "atletico", // ID del equipo visitante
      "homeScore": 4,          // Goles equipo local
      "awayScore": 2           // Goles equipo visitante
    }
  ]
}
```

#### Goleadores
```json
{
  "scorers": [
    {
      "playerId": "p1",         // ID único del jugador
      "playerName": "Carlos Pérez", // Nombre del jugador
      "teamId": "isotopos",     // ID del equipo
      "goals": 8                // Total de goles
    }
  ]
}
```

#### Puntos MVP
```json
{
  "mvp": [
    {
      "playerId": "p1",         // ID único del jugador
      "playerName": "Carlos Pérez", // Nombre del jugador
      "teamId": "isotopos",     // ID del equipo
      "points": 12              // Puntos MVP acumulados
    }
  ]
}
```

## 📝 Cómo añadir datos

### Añadir un nuevo equipo
1. Abre `index.html`
2. Busca el bloque `<script id="data-json" type="application/json">`
3. En el array `teams`, añade un nuevo objeto:
   ```json
   {
     "id": "nuevo_equipo",
     "name": "Nombre del Nuevo Equipo",
     "shortName": "Nuevo"
   }
   ```
4. Guarda el archivo
5. Recarga la página web

### Añadir un nuevo partido
1. Abre `index.html`
2. Dentro del bloque `script#data-json`, en el array `matches`, añade un nuevo objeto:
   ```json
   {
     "id": "m10",
     "jornada": 4,
     "homeTeamId": "isotopos",
     "awayTeamId": "nuevo_equipo",
     "homeScore": 3,
     "awayScore": 2
   }
   ```
4. Guarda el archivo
5. Recarga la página web

> **Nota**: La clasificación se calcula automáticamente basándose en los resultados de los partidos.

### Añadir un goleador
1. Abre `index.html`
2. Dentro del bloque `script#data-json`, en el array `scorers`, añade o actualiza un jugador:
   ```json
   {
     "playerId": "p10",
     "playerName": "Nombre del Jugador",
     "teamId": "isotopos",
     "goals": 5
   }
   ```
4. Guarda el archivo
5. Recarga la página web

### Añadir puntos MVP
1. Abre `index.html`
2. Dentro del bloque `script#data-json`, en el array `mvp`, añade o actualiza un jugador:
   ```json
   {
     "playerId": "p10",
     "playerName": "Nombre del Jugador",
     "teamId": "isotopos",
     "points": 8
   }
   ```
4. Guarda el archivo
5. Recarga la página web

## 🎨 Características

- **Diseño moderno**: Tema oscuro con efectos glassmorphism y animaciones suaves
- **Destacado especial**: El equipo "Isótopos Guadaira" se resalta automáticamente en todas las secciones
- **Responsive**: Se adapta a dispositivos móviles y tablets
- **Cálculo automático**: La clasificación se calcula automáticamente desde los resultados
- **Fácil de actualizar**: Solo edita el bloque JSON embebido (`script#data-json` en `index.html`) para actualizar toda la información

## 📱 Secciones de la aplicación

1. **Inicio**: Página de bienvenida
2. **Clasificación**: Tabla de posiciones con puntos, partidos jugados, goles, etc.
3. **Goleadores**: Ranking de máximos goleadores
4. **MVP**: Ranking de puntos MVP
5. **Resultados**: Resultados de partidos agrupados por jornada

## 💡 Consejos

- **IDs únicos**: Asegúrate de que todos los IDs (equipos, jugadores, partidos) sean únicos
- **Consistencia**: Usa siempre el mismo `teamId` para el mismo equipo en todos los arrays
- **Validación JSON**: Puedes usar herramientas online como [JSONLint](https://jsonlint.com/) para validar que tu JSON esté bien formado (copia solo el contenido del bloque `script#data-json`)
- **Backup**: Haz una copia de seguridad de `index.html` antes de hacer cambios importantes en los datos

## 🔧 Tecnologías utilizadas

- HTML5
- CSS3 (con custom properties y animaciones)
- JavaScript vanilla (ES6+)
- JSON embebido en HTML para almacenamiento de datos

---

**Nota**: Para destacar otros equipos además de Isótopos Guadaira, edita la constante `ISOTOPOS_ID` en `app.js` o modifica el código CSS para añadir más estilos de destacado.
