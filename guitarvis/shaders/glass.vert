#ifdef GL_ES
precision mediump float;
#endif

// Standard vertex attributes provided by p5.js
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Pass normal and position to the fragment shader
  vNormal = aNormal;
  vPosition = aPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
