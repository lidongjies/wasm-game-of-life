import { Universe } from '@bezos/wasm-game-of-life'
import { memory } from '@bezos/wasm-game-of-life/wasm_game_of_life_bg'

const CELL_SIZE = 5
const GRID_COLOR = '#CCCCCC'

const universe = Universe.new()
const width = universe.width()
const height = universe.height()

// 用canvas绘制网格
function drawGrid(ctx, width, height) {
  ctx.beginPath()
  ctx.strokeStyle = GRID_COLOR

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0)
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1)
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1)
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1)
  }

  ctx.stroke()
}

function getIndex(row, column) {
  return row * width + column
}

const bitInSet = (n, arr) => {
  const byte = Math.floor(n / 8)
  const mask = 1 << n % 8
  return (arr[byte] & mask) === mask
}

const bglayer = document.getElementById('gl-bg')
bglayer.width = (CELL_SIZE + 1) * width + 1
bglayer.height = (CELL_SIZE + 1) * height + 1
const context = bglayer.getContext('2d')
drawGrid(context, width, height)

const fglayer = document.getElementById('gl-fg')
const gl = fglayer.getContext('webgl')
gl.canvas.width = (CELL_SIZE + 1) * width + 1
gl.canvas.height = (CELL_SIZE + 1) * height + 1

// 将裁剪空间转换到像素空间
webglUtils.resizeCanvasToDisplaySize(gl.canvas)
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

const program = webglUtils.createProgramFromScripts(gl, ['2d-vertex-shader', '2d-fragment-shader'])
gl.useProgram(program)

const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
const positionBuffer = gl.createBuffer()
gl.enableVertexAttribArray(positionAttributeLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.clearColor(1.0, 1.0, 1.0, 1.0)

  const cellPtr = universe.cells()
  const positions = []

  // TODO:需要优化，相比canvas版本占用空间太大，js和gpu之间的内存交互影响性能
  // 这里两个三角形绘制一个正方形，6个顶点（x,y)，12个4字节浮点数共48B，随着系统趋于稳定，需要绘制的元素变少
  const cells = new Uint8Array(memory.buffer, cellPtr, (width * height) / 8)
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col)
      const isAlive = bitInSet(idx, cells)
      if (!isAlive) continue

      let [x, y] = [row * (CELL_SIZE + 1) + 1, col * (CELL_SIZE + 1) + 1]
      let p1 = [x, y]
      let p2 = [x, y + CELL_SIZE]
      let p3 = [x + CELL_SIZE, y + CELL_SIZE]
      let p4 = [x + CELL_SIZE, y]
      positions.push(...[p1, p2, p3, p3, p1, p4].flat())
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  const size = 2
  const type = gl.FLOAT
  const normalize = false
  const stride = 0
  const offset = 0
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  // 坐标系变换矩阵
  const matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight)
  gl.uniformMatrix3fv(matrixLocation, false, matrix)
  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2)
}

requestAnimationFrame(function renderLoop() {
  universe.tick()
  drawScene()
  requestAnimationFrame(renderLoop)
})
