import { Universe } from '@bezos/wasm-game-of-life'
import { memory } from '@bezos/wasm-game-of-life/wasm_game_of_life_bg'
import FPS from './fps'

const CELL_SIZE = 5
const GRID_COLOR = '#CCCCCC'

const fps = new FPS('#fps')
const universe = Universe.new()
universe.set_height(128)
universe.set_width(128)
universe.init()
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

// 判断数组中第n个bit是0或1
const bitInSet = (n, arr) => {
  const byte = Math.floor(n / 8)
  const mask = 1 << n % 8
  return (arr[byte] & mask) === mask
}

// 用canvas2D绘制网格
const bglayer = document.getElementById('gl-bg')
bglayer.width = (CELL_SIZE + 1) * width + 1
bglayer.height = (CELL_SIZE + 1) * height + 1
const context = bglayer.getContext('2d')
drawGrid(context, width, height)

// 用webgl绘制元素
const fglayer = document.getElementById('gl-fg')
const gl = fglayer.getContext('webgl')
gl.canvas.width = (CELL_SIZE + 1) * width + 1
gl.canvas.height = (CELL_SIZE + 1) * height + 1

// 将裁剪空间转换到像素空间
webglUtils.resizeCanvasToDisplaySize(gl.canvas)
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

// 构造program
const program = webglUtils.createProgramFromScripts(gl, ['2d-vertex-shader', '2d-fragment-shader'])
gl.useProgram(program)

// 获取变量位置，并启用变量
const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
const positionBuffer = gl.createBuffer()
gl.enableVertexAttribArray(positionAttributeLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

/**
 * 每次刷新将画布置为白色，获取到cells在内存中的地址，构造Uint8Array
 * 通过row,col确定该元素在数组中的索引位置，通过位运算判断该位置是否存活
 * 构造6个顶点数据（两个三角形画出一个正方形，一个三角形需要三个点）放入位置数组中
 * 将位置数据写入到GPU中，设置绘制参数
 * martix矩阵用来将基于像素的位置，映射到webgl裁剪坐标空间中
 */
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.clearColor(1.0, 1.0, 1.0, 1.0)

  const cellPtr = universe.cells()
  const positions = []

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
  const size = 2 // 每次迭代读两个数据
  const type = gl.FLOAT // 每个数据是32为浮点数
  const normalize = false // 不归一化
  const stride = 0 // 每次迭代运动多少内存到下一个迭代位置
  const offset = 0 // 开始迭代的起始位置
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  // 坐标系变换矩阵
  const matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight)
  gl.uniformMatrix3fv(matrixLocation, false, matrix)
  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2)
}

requestAnimationFrame(function renderLoop() {
  fps.render()
  universe.tick()
  drawScene()
  requestAnimationFrame(renderLoop)
})
