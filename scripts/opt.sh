#!/bin/bash

wasm-pack build
echo "after rustc opt"
wc -c pkg/wasm_game_of_life_bg.wasm

echo "after wasm-opt"
wasm-opt -Oz -o pkg/wasm_game_of_life_opt.wasm  pkg/wasm_game_of_life_bg.wasm
wc -c pkg/wasm_game_of_life_opt.wasm

# echo "after wasm-snip"
# wasm-snip pkg/wasm_game_of_life_opt.wasm -o pkg/wasm_game_of_life_snip.wasm set_panic_hook
# wc -c pkg/wasm_game_of_life_snip.wasm

echo "after gzip: " 
gzip -9 < pkg/wasm_game_of_life_opt.wasm | wc -c

# code size profiler
# twiggy top -n 20 pkg/wasm_game_of_life_opt.wasm