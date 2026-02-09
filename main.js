"use strict";
const backgroundDisabled = false;
const canvas = document.getElementsByTagName("canvas")[0];
const main = document.getElementsByTagName("div")[0];
const RED = ["#0009", [1, 0.2, 0], [0.9, 0.1, 0.1], [0.6, 0.1, 0]];
const BLUE = ["#0c2c49bb", [0, 1, 1], [0, 1, 1], [0, 0, 1]];
const PURPLE = ["#400f44bb", [1.8, 0, 2], [0, 0, 1], [1, 0, 1]];
var coverID = Math.floor(Math.random() * 3);

var backgroundColor1 = [0, 0, 0];
var backgroundColor2 = [0, 0, 0];
var backgroundColor3 = [0, 0, 0];
var timestampShift = 0;
var speed = 25;

function selectBackground() {
  var color = [RED, BLUE, PURPLE][coverID];
  timestampShift = Math.floor(Math.random() * 100000000);
  // cover.style.backgroundColor = color[0]
  main.classList.add("main" + coverID);
  updateBackgroundColors(color[1], color[2], color[3]);
}

document.addEventListener("DOMContentLoaded", function () {
  var bgButton = document.getElementById("changeBG");
  if (bgButton !== null) {
    bgButton.addEventListener("click", selectBackground);
  }
});

// -------------------------
// -------------------------
// -------------------------

/**
 * Code from https://demonin.com/games/checkBackInfiniteDescent/background.js and used with permission.
 */

const gl =
  canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

if (backgroundDisabled) {
  canvas.style.display = "none";
} else {
  canvas.style.display = "block";
}

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;

    void main()
    {
        vec2 uv = -1.0 + 2.0*gl_FragCoord.xy / resolution.xy;
        uv.x *=  resolution.x / resolution.y;
        vec3 color = vec3(0.0);
        for( int i=0; i<40; i++ )
        {
            float pha =      sin(float(i)*546.13+1.0)*0.5 + 0.5;
            float siz = pow( sin(float(i)*651.74+5.0)*0.5 + 0.5, 4.0 );
            float pox =      sin(float(i)*321.55+4.1) * resolution.x / resolution.y;
            float rad = 0.1+0.5*siz+sin(pha+siz)/4.0;
            vec2  pos = vec2( pox+sin(time/15.+pha+siz), -1.0-rad + (2.0+2.0*rad)*mod(pha+0.3*(time/7.)*(0.2+0.8*siz),1.0));
            float dis = length( uv - pos );
            vec3  col = mix( vec3(0.194*sin(time/6.0)+0.3,0.2,0.3*pha), vec3(1.1*sin(time/9.0)+0.3,0.2*pha,0.4), 0.5+0.5*sin(float(i)));
            float f = length(uv-pos)/rad;
            f = sqrt(clamp(1.0+(sin((time)*siz)*0.5)*f,0.0,1.0));
            color += col.zyx *(1.0-smoothstep( rad*0.15, rad, dis ));
        }
        color *= sqrt(3.0-1.5*length(uv));
        gl_FragColor = vec4(color,1.0);
    }

`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    console.error("Shader source:", source);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Function to create and link a shader program
function createShaderProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  //if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  //    console.error("Error linking program:", gl.getProgramInfoLog(program))
  //    return null
  //}

  return program;
}

const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
var resolutionUniformLocation, timeUniformLocation;

// Function to initialize the shader program
function initShaderProgram() {
  var shaderProgram = createShaderProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
  );

  if (!shaderProgram) return;
  gl.useProgram(shaderProgram);
  const a_position = gl.getAttribLocation(shaderProgram, "a_position");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

  resolutionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "resolution",
  );
  timeUniformLocation = gl.getUniformLocation(shaderProgram, "time");
  //backgroundColor1UniformLocation = gl.getUniformLocation(shaderProgram, "u_color1")
  //backgroundColor2UniformLocation = gl.getUniformLocation(shaderProgram, "u_color2")
  //backgroundColor3UniformLocation = gl.getUniformLocation(shaderProgram, "u_color3")
}

// Initialize shaders and buffer
initShaderProgram();

var time = 0;
function render(timestamp) {
  var diff = Math.min(timestamp - time, 1000);
  time += diff;
  var timestamp = time;
  timestamp *= speed = Math.max(1, (speed *= 0.975));
  timestamp += timestampShift;
  if (backgroundDisabled) {
    requestAnimationFrame(render);
    return;
  }
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
  gl.uniform1f(timeUniformLocation, timestamp / 500); // teehee faster than normal
  // gl.uniform3f(backgroundColor1UniformLocation,  backgroundColor1[0], backgroundColor1[1], backgroundColor1[2])
  //gl.uniform3f(backgroundColor2UniformLocation, backgroundColor2[0], backgroundColor2[1], backgroundColor2[2])
  //gl.uniform3f(backgroundColor3UniformLocation, backgroundColor3[0], backgroundColor3[1], backgroundColor3[2])
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}

function enableDisableBackground() {
  backgroundDisabled = !backgroundDisabled;
  if (backgroundDisabled) {
    canvas.style.display = "none";
  } else {
    canvas.style.display = "block";
  }
}

function updateBackgroundColors(a, b, c) {
  backgroundColor1 = a;
  backgroundColor2 = b;
  backgroundColor3 = c;
}

selectBackground();
requestAnimationFrame(render);
