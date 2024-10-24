// Setup Canvas -------------------------------------------------------------------

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  console.error("Unable to initialize WebGL. Your browser may not support it.");
}

// Game Parameters -----------------------------------------------------------------

// Set canvas and viewport
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
gl.viewport(0, 0, canvas.width, canvas.height)

// Player Properties
const playerWidth = 50;
const playerHeight = 50;

// Player Bullet Properties
const playerBulletWidth = 20;
const playerBulletHeight = 20;
const playerBulletSpeed = 7;
const bullets = [];

// Enemy Properties
const invaderWidth = 60;
const invaderHeight = 45;
const invaderSpeed = 3;
const invaders = [];

// Enemy Bullet Properties
const invaderBulletWidth = 10;
const invaderBulletHeight = 10;
const invaderBulletSpeed = 5;
const invaderBullets = [];

// Others
let lastShotTime = 0;
let score = 0;



// Shader Code and Program Code ---------------------------------------------------- 

// Vertex shader
const vertexShaderSource = `
  attribute vec2 aVertexPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying lowp vec2 vTexCoord;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
  }
`;

// Fragment shader
const fragmentShaderSource = `
  varying lowp vec2 vTexCoord;
  uniform sampler2D uTexture;

  void main(void) {
    gl_FragColor = texture2D(uTexture, vTexCoord);
  }
`;

// Create shaders
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource
);

// Create program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
  console.error(
    "Unable to initialize the shader program: " +
      gl.getProgramInfoLog(shaderProgram)
  );
}

const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    texCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    texture: gl.getUniformLocation(shaderProgram, "uTexture"),
  },
};

// Create buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
const texCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

function drawObject(object) {

  // Set position
  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [object.x, object.y, 0.0]);
  mat4.scale(modelViewMatrix, modelViewMatrix, [
    object.width,
    object.height,
    1.0,
  ]);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  // Bind texture
  gl.bindTexture(gl.TEXTURE_2D, object.texture);
  gl.uniform1i(programInfo.uniformLocations.texture, 0);

  // Draw object
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.texCoord,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}



//----- Game objects -----//

// player
const player = {
  x: canvasWidth / 2 - playerWidth / 2,
  y: canvasHeight - playerHeight - 10,
  width: playerWidth,
  height: playerHeight,
  texture: createTexture("./static/player.png"), // Load player texture
};

// enemy
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 8; j++) {
    if (Math.random() < 0.7) {
      invaders.push({
        x: j * (invaderWidth + 20) + 40,
        y: i * (invaderHeight + 20) + 40,
        width: invaderWidth,
        height: invaderHeight,
        texture: createTexture("./static/enemy.png"), // Load invader texture
      });
    }
  }
}

//----------------------------------------------------------------------------------


//render loop [logic for rendering]

function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Enable blending for transparent png
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix, 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );


  drawObject(player);
  invaders.forEach(drawObject);
  bullets.forEach(drawObject);
  invaderBullets.forEach(drawObject);

  requestAnimationFrame(render);
}

render();


//game loop [logic for the game]
const gameLoop = setInterval(() => {
  
  // Move invaders
  let changeDirection = false;
  invaders.forEach((invader) => {
    if (moveRight) {
      invader.x += invaderSpeed;
      if (invader.x + invaderWidth > canvasWidth) {
        changeDirection = true;
      }
    } else {
      invader.x -= invaderSpeed;
      if (invader.x < 0) {
        changeDirection = true;
      }
    }
  });

  if (changeDirection) {
    moveRight = !moveRight;
    invaders.forEach((invader) => {
      invader.y += invaderHeight;
    });
  }

  // Move bullets
  bullets.forEach((bullet, index) => {
    bullet.y -= playerBulletSpeed;
    if (bullet.y + playerBulletHeight < 0) {
      bullets.splice(index, 1);
    }
  });

  // Move invader bullets
  invaderBullets.forEach((bullet, index) => {
    bullet.y += invaderBulletSpeed;
    if (bullet.y > canvasHeight) {
      invaderBullets.splice(index, 1); // Remove bullet if it goes off screen
    }

    // Check for collision with the player
    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + bullet.height > player.y
    ) {
      displayMessage("Game Over!");
      clearInterval(gameLoop);
    }
  });

  // Check for collisions with the enemy
  bullets.forEach((bullet, bulletIndex) => {
    invaders.forEach((invader, invaderIndex) => {
      if (
        bullet.x < invader.x + invader.width &&
        bullet.x + bullet.width > invader.x &&
        bullet.y < invader.y + invader.height &&
        bullet.y + bullet.height > invader.y
      ) {
        bullets.splice(bulletIndex, 1);
        invaders.splice(invaderIndex, 1);
        score += 10;
        updateScoreDisplay();
      }
    });
  });

  // Check for game over
  if (invaders.some((invader) => invader.y + invader.height >= player.y)) {
    displayMessage("Game Over!");
    clearInterval(gameLoop);
  }

  // Check for win condition
  if (invaders.length === 0) {
    displayMessage("You Win!");
    clearInterval(gameLoop);
  }
}, 33);


setInterval(() => {
  if (invaders.length > 0) {
    const randomInvaderIndex = Math.floor(Math.random() * invaders.length);
    const invader = invaders[randomInvaderIndex];
    invaderBullets.push({
      x: invader.x + invader.width / 2 - invaderBulletWidth / 2,
      y: invader.y + invader.height,
      width: invaderBulletWidth,
      height: invaderBulletHeight,
      texture: createTexture("./static/bullet.png"), 
    });
  }
}, 2000); 



// Helper Functions ----------------------------------------------------------------


function updateScoreDisplay() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

// Add event listeners for player movement and shooting
document.addEventListener("keydown", (event) => {
  const currentTime = Date.now();
  switch (event.key) {
    case "ArrowLeft":
      player.x = Math.max(0, player.x - 10);
      break;
    case "ArrowRight":
      player.x = Math.min(canvasWidth - playerWidth, player.x + 10);
      break;
    case " ":
      if (currentTime - lastShotTime >= 1000) { // 1000 ms
        bullets.push({
          x: player.x + playerWidth / 2 - playerBulletWidth / 2,
          y: player.y,
          width: playerBulletWidth,
          height: playerBulletHeight,
          texture: createTexture("./static/bullet.png"),
        });
        lastShotTime = currentTime;
      }
      break;
  }
});

let moveRight = true;


function displayMessage(msg) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
}

// helper for texture generation
function createTexture(imageSrc) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = imageSrc;

  return texture;
}

//----------------------------------------------------------------------------------