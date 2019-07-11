## Introduction

这是一个 Conway‘s game of life 的 wasm 模块，使用 webpack4 在 ES Module 项目中使用，可以通过该模块实现游戏游戏对 wasm 性能有初步的了解，[webassembly 兼容性](https://caniuse.com/#search=webassembly)。

## Install

`npm install @bezos/wasm-game-of-life --save`

## Structure

```rust
struct Universe {
  width: usize,
  height: usize,
  cells: &[u8],
};
```

## API

### new()

默认构造一个 64\*64 bit 的数组

```javascript
import { Universe } from '@bezos/wasm-game-of-life'
const universe = Universe.new()
```

### init()

初始化cells

```javascript
universe.init()
```

### reset()

清空cells

```javascript
universe.reset()
```

### cells()

获取cells内存地址

```javascript
import { memory } from '@bezos/wasm-game-of-life/wasm_game_of_life_bg'
const { width, height } = universe
const cellsPtr = universe.cells()
const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8)
```

### tick()

根据上一个状态更新cells

```javascript
requestAnimationFrame(function renderLoop() {
    universe.tick()
    drawSomething()
    requestAnimationFrame(renderLoop)
})
```

### toggle_cell(row, col)

根据为止反转状态

```javascript
universe.toggle_cell(row, col)
```
