## Web GL Space Invaders - README

**Live Demo:** https://navinya-webglinvaders.netlify.app/

**Source Code:** https://github.com/NavySaw23/WebGL-SpaceInvaders

This is a WebGL implementation of the classic arcade game Space Invaders!


## Features

* Classic Space Invaders gameplay with player movement, shooting, and enemy waves.
* Scorekeeping - Earn points by defeating enemies!
* Win and Lose Conditions - The game ends when you either defeat all enemies or they reach your player.


## How to Play

* Use the arrow keys to move your spaceship left and right.
* Press space to fire your weapon.
* Avoid enemy fire and eliminate all enemies to win!


## Technical Details

This game is built using WebGL for rendering 2D graphics. Here's a breakdown of the key aspects:

* **Shaders:** Uses vertex and fragment shaders to define how objects are drawn on the screen.
* **Textures:** Loads images for the player ship, enemies, and bullets.
* **Game Loop:** Continuously updates the game state (enemy movement, bullet positions, collisions) and renders the scene.
* **Event Listeners:** Captures keyboard presses for player movement and shooting.

**Libraries:**

* This game does not use any external libraries.


## Further Development

* Sound effects
* Power-ups
* More enemy types and difficulty levels


## Running Space Invaders Locally

### 1. Clone the Repository

From your terminal, navigate to the directory where you want to save the project and use Git to clone the repository:

```bash
git clone https://github.com/NavySaw23/WebGL-SpaceInvaders.git
```


### 2. Get the Live Server Extension on VS Code
Link - https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

Press Go-Live button at bottom right of screen

