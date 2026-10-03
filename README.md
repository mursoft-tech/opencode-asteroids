# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye un power-up de velocidad y permite pausar o terminar la partida con atajos de teclado.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla            | Acción            |
| ---------------- | ----------------- |
| `←` `→`          | Rotar nave        |
| `↑`              | Propulsar         |
| `Espacio`        | Disparar          |
| `Ctrl + Shift + P` | Pausar / Reanudar |
| `Ctrl + Shift + X` | Terminar partida  |


## Puntuación

| Asteroide      | Puntos |
| -------------- | ------ |
| Grande         | 20     |
| Mediano        | 50     |
| Pequeño        | 100    |
| Estrella Fugaz | 150    |

## Power-ups

| Power-up  | Efecto                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Velocidad | Duplica la propulsión de la nave durante 5 s (la nave se dibuja en cian). Aparece al destruir asteroides medianos o grandes. |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de velocidad (x2 durante 5 s)
- Estrella Fugaz: asteroide especial más rápido, con estela cian, que no se fragmenta y desaparece tras ~6 s (150 puntos)
- Pausa y fin de partida con `Ctrl + Shift + P` / `Ctrl + Shift + X`
