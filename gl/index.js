import { Universe } from '@bezos/wasm-game-of-life'
// import { memory } from '@bezos/wasm-game-of-life/wasm_game_of_life_bg'

const animationId = null

const CELL_SIZE = 8
const GRID_COLOR = '#CCCCCC'
// const DEAD_COLOR = '#FFFFFF'
// const ALIVE_COLOR = '#000000'

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

;(async function() {
  const universe = Universe.new()
  const width = universe.width()
  const height = universe.height()

  const bglayer = document.getElementById('gl-bg')
  bglayer.width = (CELL_SIZE + 1) * width + 1
  bglayer.height = (CELL_SIZE + 1) * height + 1
  const context = bglayer.getContext('2d')
  drawGrid(context, width, height)

  const fglayer = document.getElementById('gl-fg')
  fglayer.width = (CELL_SIZE + 1) * width + 1
  fglayer.height = (CELL_SIZE + 1) * height + 1


  const renderer = new GlRenderer(fglayer)

  // // load fragment shader and createProgram
  const program = await renderer.load('./index.frag', './index.vert')
  renderer.useProgram(program)

  gl.setMeshData([
    {
      positions: [],
      cells: [],
      attributes: {
        a_position: { data:  [] }
      }
    }
  ])
  // renderer.render()
})()
