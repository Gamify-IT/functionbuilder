<template>
  <div id="game" class="game-lobby">
    <!-- Full-Screen Level Announcement -->
    <transition name="fade" mode="out-in">
      <div v-if="showLevelAnnouncement" class="level-announcement">
        Level {{ currentLevel }}
      </div>
    </transition>

    <!-- Small Congratulations Popup -->
    <transition name="fade" mode="out-in">
      <div v-if="showCongratsPopup" class="congrats-popup">
        🎉 Congratulations! Level {{ currentLevel }} Completed!
      </div>
    </transition>

    <!-- Side Panel for Logic Blocks -->
    <div class="side-panel">
      <h2 class="panel-title">{{ selectedMode }} Blocks</h2>
      <div class="logic-blocks">
        <div
          class="logic-block"
          v-for="block in logicBlocks"
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
      <div class="game-info">
        <h2 class="target-output">🎯 Target Output: {{ targetOutput }}</h2>
        <h2 class="level-text">🏆 Level: {{ currentLevel }}</h2>
        <h2 class="moves-text">🚀 Moves Left: {{ movesLeft }}</h2>
      </div>
      <div class="player-field" v-for="player in players" :key="player.id">
        <h2 class="player-name">{{ player.name }}'s Field</h2>
        <div class="input-output">
          <div class="input-value">Input: {{ player.input }}</div>
          <div class="output-arrow">→</div>
          <div class="field-area" @dragover.prevent @drop="dropBlock(player.id)">
            <transition-group name="block" tag="div">
              <div class="field-block" v-for="(block, index) in player.blocks" :key="block.id">
                {{ block.name }}
                <div v-if="index < player.blocks.length - 1" class="output-arrow">→</div>
              </div>
            </transition-group>
            <div v-for="i in maxBlocks - player.blocks.length" :key="i" class="placeholder-block">
              Drop here
            </div>
          </div>
          <div class="output-value">Output: {{ player.result }}</div>
        </div>

        <!-- New Button to Remove the Last Block -->
        <button class="remove-button" @click="removeLastBlock(player.id)">
          Remove Last Block
        </button>

        <button class="run-button" @click="executeChain(player.id)">Run Functions</button>
        <div v-if="player.result !== null" class="result">Result: {{ player.result }}</div>
        <div v-if="player.result === targetOutput" class="win-message">🎉 {{ player.name }} reached the target output!</div>
      </div>
    </div>

    <!-- Level Selection on Bottom Right -->
    <div class="number-selection">
      <div class="button-group">
        <button
          v-for="level in totalLevels"
          :key="level"
          class="number-button"
          @click="selectLevel(level)"
        >
          {{ level }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { io } from 'socket.io-client';

// Importing level configs for Algebra mode
import { level1Config, level2Config, level3Config, level4Config, level5Config } from './config/algebraConfig';

export default defineComponent({
  name: 'Game',
  setup() {
    const route = useRoute();
    const selectedMode = ref(route.query.mode || 'Algebra');
    const playerName = ref(route.query.name || localStorage.getItem('playerName') || `Player_${Math.random().toString(36).substr(2, 9)}`);
    const gameId = ref(route.params.gameId);
    const socket = io('http://localhost:3000', { transports: ['websocket'] });

    // Default logicBlocks based on selected mode and level
    const logicBlocks = ref([]);
    const totalLevels = ref(5);  // Assuming 5 levels for Algebra mode
    const currentLevel = ref(1); // Default to level 1
    const movesLeft = ref(10);   // Default moves allowed
    const targetOutput = ref(0); // Default target output, will be loaded based on level
    const showLevelAnnouncement = ref(false); // For the full-screen level announcement
    const showCongratsPopup = ref(false); // For the congratulations popup

    // Load level configuration based on current level
    const loadAlgebraConfig = () => {
      if (currentLevel.value === 1) {
        logicBlocks.value = level1Config.operations;
        movesLeft.value = level1Config.moves;
        targetOutput.value = level1Config.targetOutput;
      }
      else if (currentLevel.value === 2) {
        logicBlocks.value = level2Config.operations;
        movesLeft.value = level2Config.moves;
        targetOutput.value = level2Config.targetOutput;
      }
      else if (currentLevel.value === 3) {
        logicBlocks.value = level3Config.operations;
        movesLeft.value = level3Config.moves;
        targetOutput.value = level3Config.targetOutput;
      }
      else if (currentLevel.value === 4) {
        logicBlocks.value = level4Config.operations;
        movesLeft.value = level4Config.moves;
        targetOutput.value = level4Config.targetOutput;
      }
      else if (currentLevel.value === 5) {
        logicBlocks.value = level5Config.operations;
        movesLeft.value = level5Config.moves;
        targetOutput.value = level5Config.targetOutput;
      }
    };

    // Switch levels when user selects from the bottom-right panel
    const selectLevel = (level: number) => {
      currentLevel.value = level;
      loadAlgebraConfig();
      showLevelAnnouncement.value = true;
      setTimeout(() => {
        showLevelAnnouncement.value = false;
      }, 2000); // Display announcement for 2 seconds
    };

    watch(currentLevel, loadAlgebraConfig); // Watch for level changes

    const players = ref([
      { id: 1, name: playerName.value, blocks: [], result: null, input: selectedMode.value === 'Strings' ? 'hello' : 20 },
      { id: 2, name: 'Player 2', blocks: [], result: null, input: selectedMode.value === 'Strings' ? 'world' : 4 },
    ]);

    const maxBlocks = ref(5);
    const showingHint = ref(false);
    const hints = ref<string[]>([]);

    let draggedBlock = null;

    const dragStart = (block) => {
      draggedBlock = block;
    };

    const dropBlock = (id) => {
      const player = players.value.find((p) => p.id === id);
      if (player && draggedBlock && player.blocks.length < maxBlocks.value && movesLeft.value > 0) {
        player.blocks.push(draggedBlock);
        draggedBlock = null;
        movesLeft.value -= 1;
      }
    };

    // Remove the last block in the player's chain
    const removeLastBlock = (id) => {
      const player = players.value.find((p) => p.id === id);
      if (player && player.blocks.length > 0) {
        player.blocks.pop(); // Remove the last block
     
      }
    };

    const executeChain = (id) => {
      const player = players.value.find((p) => p.id === id);
      if (player && player.blocks.length > 0) {
        let result = player.input;
        player.blocks.forEach((block) => {
          const previousResult = result;
          result = block.operation(result);
          block.hint = `${previousResult} → ${block.name} = ${result}`;
        });
        player.result = result;

        // Check if the player has reached the target output
        if (player.result === targetOutput.value) {
          showCongratsPopup.value = true;

          // Show congratulations popup for 2 seconds
          setTimeout(() => {
            showCongratsPopup.value = false;
            // Automatically switch to the next level
            if (currentLevel.value < totalLevels.value) {
              currentLevel.value++;
              loadAlgebraConfig();
              showLevelAnnouncement.value = true;
              setTimeout(() => {
                showLevelAnnouncement.value = false;
              }, 2000);
            }
          }, 2000);
        }
      }
    };

    onMounted(() => {
      socket.emit('joinRoom', { roomId: gameId.value, playerId: playerName.value });
      setInterval(() => {
        socket.emit('requestPlayerData', gameId.value);
      }, 5000);
      socket.on('updatePlayerData', (data) => {
        console.log('Player data:', data);
      });

      // Load default configuration (Algebra Level 1)
      if (selectedMode.value === 'Algebra') {
        loadAlgebraConfig();
      }
    });

    onUnmounted(() => {
      socket.disconnect();
    });

    return {
      logicBlocks,
      players,
      targetOutput,
      dragStart,
      dropBlock,
      removeLastBlock, // Expose removeLastBlock function
      executeChain,
      selectedMode,
      currentLevel,
      movesLeft,
      maxBlocks,
      totalLevels,
      selectLevel,
      showLevelAnnouncement,
      showCongratsPopup,
      showingHint,
      hints,
    };
  },
});
</script>

<style scoped>
/* Game Layout */
.remove-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #ff5722;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 6px 12px rgba(255, 87, 34, 0.3);
}

.remove-button:hover {
  background-color: #e64a19;
  box-shadow: 0 8px 16px rgba(255, 87, 34, 0.5);
}

.congrats-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: #ffffff;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
  background-color: rgba(0, 128, 0, 0.85);
  padding: 1rem 2rem;
  border-radius: 10px;
  z-index: 9999;
  animation: popIn 0.5s ease-out, fadeOut 2s 1.5s forwards;
}

@keyframes popIn {
  from {
    transform: scale(0.5) translate(-50%, -50%);
    opacity: 0;
  }
  to {
    transform: scale(1) translate(-50%, -50%);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.level-announcement {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6rem;
  color: #ffcc00;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem 2rem;
  border-radius: 10px;
  z-index: 9999;
  animation: popIn 0.5s ease-out, fadeOut 2s 1.5s forwards;
}

@keyframes popIn {
  from {
    transform: scale(0.5) translate(-50%, -50%);
    opacity: 0;
  }
  to {
    transform: scale(1) translate(-50%, -50%);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Game Info Text Styling */
.game-info h2 {
  font-size: 2.5rem;
  color: #ffffff;
  text-align: center;
  margin: 10px 0;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
}

.target-output {
  color: #ffcc00;
}

.level-text {
  color: #4caf50;
}

.moves-text {
  color: #ff5722;
}

.game-lobby {
  display: flex;
  height: 100vh;
  background: linear-gradient(to bottom right, #2b5876, #4e4376);
  background-size: 300% 300%;
  animation: backgroundAnimation 15s ease infinite;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  position: relative;
}

/* Background Animation */
@keyframes backgroundAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Scoreboard Styling */
.scoreboard {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 200px;
  background-color: rgba(44, 47, 51, 0.9);
  color: #ffffff;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.scoreboard h2 {
  font-size: 18px;
  text-align: center;
  margin-bottom: 10px;
}

.scoreboard ul {
  list-style: none;
  padding: 0;
}

.scoreboard li {
  font-size: 16px;
  margin-bottom: 5px;
}


/* Progress Bar Styling */
.progress-bar-container {
  margin-top: 20px;
  width: 80%;
  text-align: center;
}

.progress-bar {
  background-color: #ddd;
  border-radius: 10px;
  overflow: hidden;
  height: 20px;
  width: 100%;
  margin: auto;
}

.progress-bar-fill {
  background-color: #4caf50;
  height: 100%;
  transition: width 0.5s;
}

/* Achievement Popup Styling */
.achievement-popup {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 215, 0, 0.9);
  color: #333;
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
  animation: slideIn 0.5s ease-out, fadeOut 0.5s 2.5s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Gear Background Animation */
.gear-background {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.gear {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
}

.large-gear {
  width: 100px;
  height: 100px;
  left: 10%;
  bottom: 10%;
  animation: rotateGear 10s linear infinite;
}

.small-gear {
  width: 50px;
  height: 50px;
  left: 25%;
  bottom: 15%;
  animation: rotateGear 6s linear infinite;
}

@keyframes rotateGear {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Background animation */
@keyframes backgroundAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
/* Adding animated decorations to the background */
.game-lobby::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1), transparent),
                    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05), transparent);
  animation: floatDecorations 10s infinite;
}
@keyframes floatDecorations {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
/* Particle effect floating around */
.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* So it doesn't interfere with gameplay */
  z-index: 1;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: particleAnimation 8s infinite ease-in-out;
}

.particle:nth-child(2) { animation-duration: 10s; left: 20%; }
.particle:nth-child(3) { animation-duration: 12s; top: 80%; }
.particle:nth-child(4) { animation-duration: 14s; left: 70%; top: 20%; }

/* Floating particles */
@keyframes particleAnimation {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
  50% { transform: translate(30px, 30px) scale(1.2); opacity: 1; }
  100% { transform: translate(100px, 100px) scale(0.5); opacity: 0; }
}
.side-panel {
  width: 25%;
  background: linear-gradient(145deg, #2c2f34, #232629);
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
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

.expression-types {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.expression-types button {
  padding: 10px 15px;
  background: linear-gradient(145deg, #ff7e5f, #feb47b);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.expression-types button.active {
  background-color: #fe8c00;
}

.expression-types button:hover {
  transform: scale(1.05);
  background: linear-gradient(145deg, #fe8c00, #f83600);
}

.logic-blocks {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logic-block {
  padding: 15px 20px;
  background: linear-gradient(145deg, #ff7e5f, #feb47b);
  color: white;
  text-align: center;
  border-radius: 10px;
  cursor: grab;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  font-weight: 500;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.logic-block:hover {
  transform: scale(1.05);
  background: linear-gradient(145deg, #fe8c00, #f83600);
  box-shadow: 0 8px 16px rgba(255, 126, 95, 0.5);
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
  color: #ffffff;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.player-field {
  background: linear-gradient(145deg, #2c2f34, #232629);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
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
  display: flex; /* Enables flexbox */
  flex-direction: row; /* Aligns blocks in a row */
  flex-wrap: nowrap; /* Prevents wrapping */
  justify-content: flex-start; /* Aligns items to the left */
  align-items: center; /* Vertically centers the items */
  gap: 10px; /* Adds space between blocks */
  padding: 10px;
  border: 2px dashed #ff7e5f;
  border-radius: 8px;
  background-color: #343a40;
  overflow-x: auto; /* Allows horizontal scrolling if necessary */
}

.field-area:hover {
  background-color: #3c4045;
  border-color: #fe8c00;
}

.field-block {
  flex-shrink: 0; /* Prevents blocks from shrinking */
  width: auto; /* Make sure blocks only take the space they need */
  padding: 10px;
  background-color: #f0b429;
  color: black;
  text-align: center;
  border-radius: 8px;
  display: inline-block;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(240, 180, 41, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
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
  padding: 15px 30px;
  background: linear-gradient(145deg, #ff416c, #ff4b2b); /* Gradient colors for a fancy look */
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
  box-shadow: 0 6px 12px rgba(255, 65, 108, 0.3); /* Soft shadow for depth */
  position: relative;
  overflow: hidden;
}

.run-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300%;
  height: 300%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
  transition: width 0.4s, height 0.4s, top 0.4s, left 0.4s;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
}

.run-button:hover::before {
  width: 150%;
  height: 150%;
  top: 50%;
  left: 50%;
}

.run-button:hover {
  transform: translateY(-5px); /* Lift effect */
  box-shadow: 0 12px 24px rgba(255, 65, 108, 0.5);
}

.run-button:active {
  transform: translateY(1px); /* Push down on click */
  box-shadow: 0 4px 8px rgba(255, 65, 108, 0.3);
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
  color: #ffffff;
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
  left: 105%;
  background-color: rgba(44, 47, 51, 0.9);
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  text-align: left;
  font-size: 14px;
  width: 150px;
  white-space: nowrap;
}

/* Bottom-right window for number selection */
.number-selection {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(145deg, #2c2f34, #232629);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.number-button {
  width: 45px;
  height: 45px;
  background: linear-gradient(145deg, #ff7e5f, #feb47b);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
}

.number-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 126, 95, 0.5);
  background: linear-gradient(145deg, #fe8c00, #f83600);
}

.number-button:active {
  transform: translateY(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

</style>