import { memory } from '@bezos/wasm-game-of-life/wasm_game_of_life_bg'
import { Universe } from '@bezos/wasm-game-of-life'
// import FPS from '../fps'

// fps tool
// let fps = new FPS('#fps')

const CELL_SIZE = 5
const GRID_COLOR = '#CCCCCC'
const DEAD_COLOR = '#FFFFFF'
const ALIVE_COLOR = '#000000'

let animationId = null

const canvas = document.getElementById('game-of-life-canvas')
const playPauseBtn = document.getElementById('play-pause')
const randomInit = document.getElementById('random-init')
const reset = document.getElementById('reset')

const universe = Universe.new()
const width = universe.width()
const height = universe.height()
canvas.width = (CELL_SIZE + 1) * width + 1
canvas.height = (CELL_SIZE + 1) * height + 1

function getIndex(row, column) {
  return row * width + column
}

const bitInSet = (n, arr) => {
  const byte = Math.floor(n / 8)
  const mask = 1 << n % 8
  return (arr[byte] & mask) === mask
}

const ctx = canvas.getContext('2d')

function drawGrid() {
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

function drawCells() {
  const cellsPtr = universe.cells()
  const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8)
  ctx.beginPath()

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col)
      ctx.fillStyle = bitInSet(idx, cells) ? ALIVE_COLOR : DEAD_COLOR
      ctx.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE)
    }
  }

  // 优化ctx.fillStyle，怀疑浏览器做了优化，将ctx.fillStyle没效果
  // ctx.fillStyle = ALIVE_COLOR
  // for (let row = 0; row < height; row++) {
  // 	for (let col = 0; col < width; col++) {
  // 		const idx = getIndex(row, col)
  // 		if (!bitInSet(idx, cells)) continue
  // 		ctx.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE)
  // 	}
  // }

  // ctx.fillStyle = DEAD_COLOR
  // for (let row = 0; row < height; row++) {
  // 	for (let col = 0; col < width; col++) {
  // 		const idx = getIndex(row, col)
  // 		if (bitInSet(idx, cells)) continue
  // 		ctx.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE)
  // 	}
  // }

  ctx.stroke()
}

function renderLoop() {
  // fps.render()
  universe.tick()
  drawCells()
  animationId = requestAnimationFrame(renderLoop)
}

// 开始结束控制
function isPaused() {
  return animationId === null
}

function play() {
  playPauseBtn.textContent = '暂停'
  renderLoop()
}

function pause() {
  playPauseBtn.textContent = '继续'
  cancelAnimationFrame(animationId)
  animationId = null
}

playPauseBtn.addEventListener('click', event => {
  if (isPaused()) {
    play()
  } else {
    pause()
  }
})

randomInit.addEventListener('click', event => {
  cancelAnimationFrame(animationId)
  animationId = null
  universe.init()
  renderLoop()
})

reset.addEventListener('click', event => {
  cancelAnimationFrame(animationId)
  animationId = null
  universe.reset()
  drawCells()
})

canvas.addEventListener('click', event => {
  let boundingRect = canvas.getBoundingClientRect()

  // 计算缩放
  let scaleX = canvas.width / boundingRect.width
  let scaleY = canvas.height / boundingRect.height

  // 计算出发点在canvas中的位置
  let canvasLeft = (event.clientX - boundingRect.left) * scaleX
  let canvasTop = (event.clientY - boundingRect.top) * scaleY

  // 计算坐标
  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1)
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1)

  // 改变状态并重新绘制
  universe.toggle_cell(row, col)
  drawCells()
})

// 开始动画
drawGrid()
play()
