#ifdef GL_ES
precision mediump float;
#endif

// Our custom fill color (set from the sketch)
uniform vec3 uFillColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Simple directional lighting
  vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
  float diff = max(dot(normalize(vNormal), lightDir), 0.0);
  
  // Add a bit of extra brightness for a “glow” effect
  vec3 color = uFillColor * diff + uFillColor * 0.3;
  
  // Output with semi-transparency (alpha = 0.5)
  gl_FragColor = vec4(color, 0.5);
}
