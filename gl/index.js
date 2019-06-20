;(async function() {
  const glCanvas = document.getElementById('gl-canvas')
  const renderer = new GlRenderer(glCanvas)

  // load fragment shader and createProgram
  const program = await renderer.load('./index.frag')
  renderer.useProgram(program)

  // set color to RED
  renderer.uniforms.color = [1, 0, 0]

  renderer.render()
})()
