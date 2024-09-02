<template>
    <div id="lambda-game" class="game-lobby">
      <!-- Side Panel for Logic Blocks -->
      <div class="side-panel">
        <h2 class="panel-title">Lambda Expressions</h2>
        <div class="expression-types">
          <button
            v-for="type in expressionTypes"
            :key="type"
            :class="{ active: selectedType === type }"
            @click="changeExpressionType(type)"
          >
            {{ type }}
          </button>
        </div>
        <div class="logic-blocks">
          <div
            class="logic-block"
            v-for="block in currentBlocks"
            :key="block.id"
            draggable="true"
            @dragstart="dragStart(block)"
          >
            {{ block.name }}
          </div>
        </div>
      </div>
  
      <!-- Player Fields -->
      <div class="player-fields">
        <h2 class="target-output">Target Output: {{ targetOutput }}</h2>
        <div class="player-field" v-for="player in players" :key="player.id">
          <h2 class="player-name">{{ player.name }}'s Field</h2>
          <div class="input-output">
            <div class="input-value">Input: {{ player.input }}</div>
            <div class="output-arrow">→</div>
            <div
              class="field-area"
              @dragover.prevent
              @drop="dropBlock(player.id)"
            >
              <transition-group name="block" tag="div">
                <div
                  class="field-block"
                  v-for="(block, index) in player.blocks"
                  :key="block.id"
                >
                  {{ block.name }}
                  <div
                    v-if="index < player.blocks.length - 1"
                    class="output-arrow"
                  >
                    →
                  </div>
                </div>
              </transition-group>
              <div
                v-for="i in maxBlocks - player.blocks.length"
                :key="i"
                class="placeholder-block"
              >
                Drop here
              </div>
            </div>
            <div class="output-value">Output: {{ player.result }}</div>
            <!-- Hint Button and Tooltip next to the result -->
            <div class="hint-container">
              <button class="hint-button" @mouseover="showHint" @mouseleave="hideHint">
                Hint
              </button>
              <div v-if="showingHint" class="hint-tooltip">
                <p v-for="hint in hints" :key="hint">{{ hint }}</p>
              </div>
            </div>
          </div>
          <button class="run-button" @click="executeChain(player.id)">
            Run Functions
          </button>
          <div v-if="player.result !== null" class="result">
            Result: {{ player.result }}
          </div>
          <div v-if="player.result === targetOutput" class="win-message">
            🎉 {{ player.name }} reached the target output!
          </div>
        </div>
        <div class="game-info">
          <p>Level: {{ currentLevel }}</p>
          <p>Moves Left: {{ movesLeft }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    name: 'LambdaGame',
    setup() {
      // Define different expression types
      const expressionTypes = ref(['Lambda', 'Normal Function', 'Stream']);
  
      // Keep track of the selected expression type
      const selectedType = ref('Lambda');
  
      // Define logic blocks for lambda expressions
      const lambdaBlocks = ref([
        { id: 1, name: 'x => x * 2', operation: (x: number) => x * 2 },
        { id: 2, name: 'x => x + 10', operation: (x: number) => x + 10 },
        { id: 3, name: 'x => x - 5', operation: (x: number) => x - 5 },
        { id: 4, name: 'x => x % 2', operation: (x: number) => x % 2 },
      ]);
  
      // Define logic blocks for normal function expressions
      const normalBlocks = ref([
        {
          id: 1,
          name: 'function(x) { return x * 2; }',
          operation: function (x: number) {
            return x * 2;
          },
        },
        {
          id: 2,
          name: 'function(x) { return x + 10; }',
          operation: function (x: number) {
            return x + 10;
          },
        },
        {
          id: 3,
          name: 'function(x) { return x - 5; }',
          operation: function (x: number) {
            return x - 5;
          },
        },
        {
          id: 4,
          name: 'function(x) { return x % 2; }',
          operation: function (x: number) {
            return x % 2;
          },
        },
      ]);
  
      // Define logic blocks for stream expressions
      const streamBlocks = ref([
        {
          id: 1,
          name: 'arr.map(x => x * 2)',
          operation: (arr: number[]) => arr.map((x) => x * 2),
        },
        {
          id: 2,
          name: 'arr.filter(x => x % 2 === 0)',
          operation: (arr: number[]) => arr.filter((x) => x % 2 === 0),
        },
        {
          id: 3,
          name: 'arr.reduce((acc, x) => acc + x, 0)',
          operation: (arr: number[]) => arr.reduce((acc, x) => acc + x, 0),
        },
      ]);
  
      // Determine which set of blocks to use based on the selected type
      const currentBlocks = ref(lambdaBlocks.value);
  
      const changeExpressionType = (type: string) => {
        selectedType.value = type;
        if (type === 'Lambda') {
          currentBlocks.value = lambdaBlocks.value;
        } else if (type === 'Normal Function') {
          currentBlocks.value = normalBlocks.value;
        } else if (type === 'Stream') {
          currentBlocks.value = streamBlocks.value;
        }
      };
  
      // Initialize players
      const players = ref([
        { id: 1, name: 'Player 1', blocks: [], result: null, input: 2 },
        { id: 2, name: 'Player 2', blocks: [], result: null, input: 4 },
      ]);
  
      const targetOutput = ref(16); // Example target output for Lambda expressions
      const maxBlocks = ref(5);
      const currentLevel = ref(1);
      const movesLeft = ref(10);
      const showingHint = ref(false);
      const hints = ref<string[]>([]);
  
      let draggedBlock = null;
  
      const dragStart = (block) => {
        draggedBlock = block;
      };
  
      const dropBlock = (id) => {
        const player = players.value.find((p) => p.id === id);
        if (player && draggedBlock && player.blocks.length < maxBlocks.value) {
          player.blocks.push(draggedBlock);
          draggedBlock = null;
          movesLeft.value -= 1;
        }
      };
  
      const executeChain = (id) => {
        const player = players.value.find((p) => p.id === id);
        if (player && player.blocks.length > 0) {
          let result = player.input;
          player.blocks.forEach(block => {
            const previousResult = result;
            result = block.operation(result);
            block.hint = `${previousResult} → ${block.name} = ${result}`;
          });
          player.result = result;
        }
      };
  
      const showHint = () => {
        showingHint.value = true;
        const player = players.value[0]; // Assuming hints are for Player 1
        if (player) {
          hints.value = player.blocks.map(block => block.hint);
        }
      };
  
      const hideHint = () => {
        showingHint.value = false;
      };
  
      return {
        expressionTypes,
        selectedType,
        lambdaBlocks,
        normalBlocks,
        streamBlocks,
        players,
        targetOutput,
        dragStart,
        dropBlock,
        executeChain,
        currentLevel,
        movesLeft,
        maxBlocks,
        currentBlocks,
        changeExpressionType,
        showingHint,
        hints,
        showHint,
        hideHint,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Keep the previous styles */
  .game-lobby {
    display: flex;
    height: 100vh;
    background-color: #f5f7fa;
    padding: 20px;
    font-family: 'Roboto', sans-serif;
    overflow: hidden;
    position: relative;
  }
  
  .side-panel {
    width: 25%;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    margin-right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
  }
  
  .panel-title {
    font-size: 22px;
    margin-bottom: 20px;
    color: #003366;
    font-weight: 700;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  }
  
  .expression-types {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .expression-types button {
    padding: 10px 15px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .expression-types button.active {
    background-color: #357abd;
  }
  
  .expression-types button:hover {
    background-color: #357abd;
  }
  
  .logic-blocks {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .logic-block {
    padding: 15px 20px;
    background: #4a90e2;
    color: white;
    text-align: center;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
    font-weight: 500;
    font-size: 16px;
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
  }
  
  .logic-block:hover {
    background-color: #357abd;
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 123, 255, 0.3);
  }
  
  .player-fields {
    display: flex;
    flex-direction: column;
    width: 75%;
    gap: 30px;
    z-index: 1;
  }
  
  .target-output {
    font-size: 20px;
    color: #003366;
    text-align: center;
    margin-bottom: 10px;
    font-weight: 700;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  }
  
  .player-field {
    background-color: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .player-name {
    font-size: 18px;
    margin-bottom: 15px;
    color: #003366;
    font-weight: 700;
  }
  
  .input-output {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .input-value,
  .output-value {
    font-weight: 700;
    color: #003366;
    background-color: #e7f0fd;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-size: 14px;
  }
  
  .field-area {
  display: flex; /* Ensure horizontal alignment */
  gap: 10px; /* Space between blocks */
  min-height: 60px;
  padding: 10px;
  border: 2px dashed #4a90e2;
  border-radius: 8px;
  background-color: #e9ecef;
  transition: background-color 0.3s, border-color 0.3s;
  overflow-x: auto; /* Enable horizontal scrolling if content overflows */
  flex-wrap: nowrap; /* Prevents blocks from wrapping to the next line */
}
  
  .field-area:hover {
    background-color: #d0d0d0;
    border-color: #357abd;
  }
  
  .field-block {
  padding: 10px;
  background-color: #ffc107;
  color: black;
  text-align: center;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0; /* Prevents blocks from shrinking */
}
  
  .field-block:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(255, 193, 7, 0.3);
  }
  
  .placeholder-block {
    width: 100px;
    height: 40px;
    background-color: #dcdcdc;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #888;
    border: 1px dashed #ccc;
  }
  
  .output-arrow {
    font-size: 24px;
    color: #888;
  }
  
  .run-button {
    margin-top: 20px;
    padding: 15px 30px;
    background: #50c878;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2);
  }

  .hint-container {
  display: inline-block;
  position: relative;
  margin-left: 10px;
}

.hint-button {
  padding: 10px 20px;
  background-color: #ffc107;
  color: #333;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
}

.hint-button:hover {
  background-color: #e0a800;
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(255, 193, 7, 0.3);
}

.hint-tooltip {
  position: absolute;
  top: -10px;
  left: 105%; /* Positions tooltip to the right of the hint button */
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: left;
  font-size: 14px;
  width: 150px;
  white-space: nowrap; /* Prevents text wrapping */
}

  .run-button:hover {
    background-color: #3dae66;
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(40, 167, 69, 0.3);
  }
  
  .result {
    margin-top: 10px;
    font-size: 18px;
    font-weight: bold;
    color: #003366;
    background-color: #e7f0fd;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .win-message {
    margin-top: 10px;
    font-size: 18px;
    font-weight: bold;
    color: #50c878;
  }
  
  .game-info {
    margin-top: 20px;
    font-size: 16px;
    color: #003366;
    text-align: center;
  }

 
.game-lobby {
  display: flex;
  height: 100vh;
  background: linear-gradient(to bottom right, #1b1f23, #14171a);
  background-image: radial-gradient(circle, #00000030, #00000015);
  background-blend-mode: overlay;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  position: relative;
}


.game-lobby::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 10%, transparent 10%);
  background-size: 100px 100px;
  animation: backgroundMove 30s infinite linear;
  z-index: 0;
}

@keyframes backgroundMove {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.side-panel {
  width: 25%;
  background-color: rgba(44, 47, 51, 0.9);
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.panel-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ffffff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.logic-blocks {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.logic-block {
  padding: 15px 10px;
  background: linear-gradient(145deg, #5865f2, #404eed);
  color: white;
  text-align: center;
  border-radius: 10px;
  cursor: grab;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 8px rgba(88, 101, 242, 0.2);
}

.logic-block:hover {
  background-color: #404eed;
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(88, 101, 242, 0.3);
}

.player-fields {
  display: flex;
  flex-direction: column;
  width: 75%;
  gap: 30px;
  z-index: 1;
}

.target-output {
  font-size: 20px;
  color: #000000;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.player-field {
  background-color: rgba(35, 39, 42, 0.9);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-name {
  font-size: 18px;
  margin-bottom: 15px;
  color: #ffffff;
}

.input-output {
  display: flex;
  align-items: center;
  gap: 15px;
}

.input-value,
.output-value {
  font-weight: bold;
  color: #ffffff;
  background-color: #4a4e69;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.field-area {
  display: flex;
  gap: 10px;
  min-height: 60px;
  padding: 10px;
  border: 2px dashed #5865f2;
  border-radius: 8px;
  background-color: #343a40;
  transition: background-color 0.3s, border-color 0.3s;
  overflow-x: auto; /* Enable horizontal scrolling if content overflows */
  flex-wrap: nowrap; /* Prevents blocks from wrapping to the next line */
}

.field-area:hover {
  background-color: #3c4045;
  border-color: #404eed;
}

.field-block {
  padding: 10px;
  background-color: #f0b429;
  color: black;
  text-align: center;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(240, 180, 41, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0; /* Prevents blocks from shrinking */
}

.field-block:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(240, 180, 41, 0.3);
}

.placeholder-block {
  width: 100px;
  height: 40px;
  background-color: #4a4e69;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  border: 1px dashed #ccc;
}

.output-arrow {
  font-size: 24px;
  color: #ffffff;
}

.run-button {
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(145deg, #1f8b4c, #14532d);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 8px rgba(31, 139, 76, 0.2);
}

.run-button:hover {
  background-color: #14532d;
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(31, 139, 76, 0.3);
}

.result {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  background-color: #4a4e69;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  display: inline-block; /* Ensures the hint button is beside it */
}

.win-message {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #1f8b4c;
}

.game-info {
  margin-top: 20px;
  font-size: 16px;
  color: #000000;
  text-align: center;
}

.hint-container {
  display: inline-block;
  position: relative;
  margin-left: 10px;
}

.hint-button {
  padding: 10px 20px;
  background-color: #f0b429;
  color: #333;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 8px rgba(240, 180, 41, 0.2);
}

.hint-button:hover {
  background-color: #e0a800;
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(240, 180, 41, 0.3);
}

.hint-tooltip {
  position: absolute;
  top: -10px;
  left: 105%; /* Positions tooltip to the right of the hint button */
  background-color: rgba(44, 47, 51, 0.9);
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  text-align: left;
  font-size: 14px;
  width: 150px;
  white-space: nowrap; /* Prevents text wrapping */
}

 
  </style>
  