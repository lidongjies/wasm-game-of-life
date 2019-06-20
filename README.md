## 介绍
这是一个 Conway‘s game of life 的 wasm 模块，使用 webpack4 在 ES Module 项目中使用，可以通过该模块实现游戏游戏对 wasm 性能有初步的了解，[webassembly 兼容性](https://caniuse.com/#search=webassembly)。

## API

```rust
struct Universe {
  width: usize,
  height: usize,
  cells: &[u8],
};
```

### new()

默认构造一个64*64 bit的数组

```javascript
const universe = Universe.new();
```

### init()

重置数组

```javascript
universe.init();
```

### reset()

置空数组

```javascript
universe.reset();
```

### cells()

获取数组头内存地址

```javascript
import { memory } from 'wasm-game-of-life/wasm_game_of_life_bg'
const { width, height } = universe;
const cellsPtr = universe.cells()
const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8)
```

### tick()

获取新的数组

```javascript
function renderLoop() {
	universe.tick()
	drawSomething()
	requestAnimationFrame(renderLoop)
}
```

### toggle_cell()

反转某一格的状态

```javascript
universe.toggle_cell(row, col);
```

## TODO
1. 添加输入控件
   [x] reset and init control
   [] shape template
2. 优化执行时间
   [x] proformance panel => 定位
   [x] fillStyle => higher scope
   [] canvas => webgl WIP
   [] benchmark + pref 定位代码执行
3. 优化文件大小
   [x] https://rustwasm.github.io/docs/book/game-of-life/code-size.html
   [x] https://rustwasm.github.io/docs/book/reference/code-size.html#use-the-wasm-snip-tool