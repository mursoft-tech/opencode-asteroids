# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye un power-up de velocidad, un escudo que protege de los proyectiles enemigos, OVNIs hostiles y permite pausar o terminar la partida con atajos de teclado.

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
| `S`              | Cambiar skin (en juego) |
| `1`–`4` / `←` `→` | Elegir skin (en pausa) |
| `Ctrl + Shift + P` | Pausar / Reanudar |
| `Ctrl + Shift + X` | Terminar partida  |


## Puntuación

| Asteroide      | Puntos |
| -------------- | ------ |
| Grande         | 20     |
| Mediano        | 50     |
| Pequeño        | 100    |
| Estrella Fugaz | 150    |
| OVNI enemigo   | 200    |

## Power-ups

| Power-up  | Efecto                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Velocidad | Duplica la propulsión de la nave durante 5 s (la nave se dibuja en cian). Aparece al destruir asteroides medianos o grandes. |
| Escudo    | Protege a la nave de los proyectiles enemigos durante 8 s (anillo verde). Aparece al destruir un OVNI.                        |

## Skins

Se cambian con la tecla `S` en pleno juego (cicla a la siguiente) o desde el menú de pausa (`Ctrl + Shift + P`) con las teclas `1`–`4` o las flechas `←` `→`. La elección se guarda en `localStorage` y se aplica también a los iconos de vida.

| # | Skin        | Apariencia                                  |
| - | ----------- | ------------------------------------------- |
| 1 | Clásica     | Triángulo con muesca trasera (original)     |
| 2 | Interceptor | Flecha afilada y alargada                   |
| 3 | Pesada      | Casco ancho hexagonal con detalle central   |
| 4 | Fantasma    | Contorno punteado                           |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de velocidad (x2 durante 5 s)
- Power-up de escudo (absorbe proyectiles enemigos durante 8 s)
- OVNIs enemigos que cruzan la pantalla disparando a la nave
- Estrella Fugaz: asteroide especial más rápido, con estela cian, que no se fragmenta y desaparece tras ~6 s (150 puntos)
- Skins de nave seleccionables desde la pausa, persistentes entre partidas
- Pausa y fin de partida con `Ctrl + Shift + P` / `Ctrl + Shift + X`
