<template>
  <div id="game" class="game-lobby">
    <!-- Side Panel for Logic Blocks -->
    <div class="side-panel">
      <h2>Algebra Blocks</h2>
      <div class="logic-blocks">
        <div
          class="logic-block"
          v-for="block in algebraBlocks"
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
      <h2>Target Output: {{ targetOutput }}</h2>
      <div class="player-field" v-for="player in players" :key="player.id">
        <h2>{{ player.name }}'s Field</h2>
        <div class="input-output">
          <div class="input-value">Input: {{ player.input }}</div>
          <div class="output-arrow">→</div>
          <div
            class="field-area"
            @dragover.prevent
            @drop="dropBlock(player.id)"
          >
            <div
              class="field-block"
              v-for="(block, index) in player.blocks"
              :key="block.id"
            >
              {{ block.name }}
              <div v-if="index < player.blocks.length - 1" class="output-arrow">
                →
              </div>
            </div>
            <div
              v-for="i in 5 - player.blocks.length"
              :key="i"
              class="placeholder-block"
            >
              Drop here
            </div>
          </div>
          <div class="output-value">Output: {{ player.result }}</div>
        </div>
        <button @click="executeChain(player.id)">Run Functions</button>
        <div v-if="player.result !== null" class="result">
          Result: {{ player.result }}
        </div>
        <div v-if="player.result === targetOutput" class="win-message">
          🎉 {{ player.name }} reached the target output!
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'Game',
  setup() {
    const algebraBlocks = ref([
      { id: 1, name: 'X^2', operation: (x: number) => Math.pow(x, 2) },
      { id: 2, name: 'X^X', operation: (x: number) => Math.pow(x, x) },
      { id: 3, name: 'X / 2', operation: (x: number) => x / 2 },
      { id: 4, name: '√X', operation: (x: number) => Math.sqrt(x) },
      { id: 5, name: 'X + 5', operation: (x: number) => x + 5 },
      { id: 6, name: 'X - 3', operation: (x: number) => x - 3 },
    ]);

    const players = ref([
      { id: 1, name: 'Player 1', blocks: [], result: null, input: 2 },
      { id: 2, name: 'Player 2', blocks: [], result: null, input: 4 },
    ]);

    const targetOutput = ref(16); // Example target output
    const route = useRoute();
    const gameId = ref(route.params.gameId);

    let draggedBlock = null;

    const dragStart = (block) => {
      draggedBlock = block;
    };

    const dropBlock = (id) => {
      const player = players.value.find((p) => p.id === id);
      if (player && draggedBlock && player.blocks.length < 5) {
        player.blocks.push(draggedBlock);
        draggedBlock = null;
      }
    };

    const executeChain = (id) => {
      const player = players.value.find((p) => p.id === id);
      if (player && player.blocks.length > 0) {
        let result = player.input;
        for (const block of player.blocks) {
          result = block.operation(result);
        }
        player.result = result;
      }
    };

    onMounted(() => {
      // No need to join a game or connect to WebSocket for single player
    });

    return { algebraBlocks, players, targetOutput, dragStart, dropBlock, executeChain };
  },
});
</script>

<style scoped>
/* Game Lobby Layout */
.game-lobby {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* Side Panel */
.side-panel {
  width: 20%;
  background-color: #fff;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.side-panel h2 {
  font-size: 18px;
  margin-bottom: 15px;
}

.logic-blocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logic-block {
  padding: 10px;
  background-color: #007bff;
  color: white;
  text-align: center;
  border-radius: 5px;
  cursor: grab;
  transition: background-color 0.3s;
}

.logic-block:hover {
  background-color: #0056b3;
}

/* Player Fields */
.player-fields {
  display: flex;
  flex-direction: column;
  width: 80%;
  gap: 20px;
}

.player-field {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.player-field h2 {
  font-size: 16px;
  margin-bottom: 10px;
}

.input-output {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-value,
.output-value {
  font-weight: bold;
}

.field-area {
  display: flex;
  gap: 10px;
  min-height: 60px;
  padding: 10px;
  border: 2px dashed #007bff;
  border-radius: 5px;
  background-color: #e9ecef;
}

.field-block {
  padding: 10px;
  background-color: #ffc107;
  color: black;
  text-align: center;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.placeholder-block {
  width: 100px;
  height: 40px;
  background-color: #dcdcdc;
  border-radius: 5px;
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

button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

.result {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}

.win-message {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #28a745;
}
</style>
