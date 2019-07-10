#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0, 1);
}
