<template>
  <div id="enhanced-game" class="game-lobby">
    <!-- Main Operation Area -->
    <div class="main-area">
      <h2 class="target-output">Target Output: {{ targetOutput }}</h2>

      <!-- Drag and Drop Area -->
      <div class="drag-drop-area">
        <h3>Apply Functions</h3>
        <div class="input-output">
          <div class="input-value">Input: {{ input }}</div>
          <div class="output-arrow">→</div>
          <div class="field-area" @dragover.prevent @drop="dropBlock">
            <transition-group name="block" tag="div">
              <div
                class="field-block"
                v-for="(block, index) in blocks"
                :key="block.id"
              >
                {{ block.name }}
                <div v-if="index < blocks.length - 1" class="output-arrow">→</div>
              </div>
            </transition-group>
            <div v-for="i in maxBlocks - blocks.length" :key="i" class="placeholder-block">
              Drop here
            </div>
          </div>
          <div class="output-value">Output: {{ result }}</div>
        </div>
      </div>

      <!-- Code Writing Area -->
      <div class="code-area">
        <h3>Write Code</h3>
        <textarea v-model="codeSnippet" placeholder="Write your code here..."></textarea>
        <button @click="runCode">Run Code</button>
        <div v-if="codeOutput !== null" class="code-result">
          Result: {{ codeOutput }}
        </div>
        <div v-if="codeOutput === targetOutput" class="win-message">
          🎉 Correct Output!
        </div>
      </div>

      <!-- Multiple Choice Quiz Area -->
      <div class="quiz-area">
        <h3>Quiz: Choose the Correct Operation</h3>
        <div v-for="(option, index) in quizOptions" :key="index" class="quiz-option">
          <input type="radio" :id="'option-' + index" :value="option" v-model="selectedOption" />
          <label :for="'option-' + index">{{ option }}</label>
        </div>
        <button @click="submitQuizAnswer">Submit Answer</button>
        <div v-if="quizFeedback" class="quiz-feedback">
          {{ quizFeedback }}
        </div>
      </div>
    </div>

    <!-- Side Panel for Additional Challenges -->
    <div class="side-panel">
      <h2 class="panel-title">Challenges</h2>
      <div class="challenges" >
        <p v-if="!currentChallenge">Complete the tasks above to unlock challenges.</p>
        <div v-else>
          <h3>{{ currentChallenge.title }}</h3>
          <p>{{ currentChallenge.description }}</p>
          <button @click="solveChallenge">Solve Challenge</button>
        </div>
      </div>
    </div>

    <!-- Power-Ups and Tools Area -->
    <div class="tools-panel">
      <h2 class="panel-title">Power-Ups</h2>
      <div class="power-ups">
        <button v-for="(tool, index) in powerUps" :key="index" @click="usePowerUp(tool)">
          {{ tool.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'EnhancedGame',
  setup() {
    // Game state variables
    const blocks = ref([]);
    const maxBlocks = ref(5);
    const input = ref(2);
    const result = ref(null);
    const codeSnippet = ref('');
    const codeOutput = ref(null);
    const quizOptions = ref(['x * 2', 'x + 10', 'x - 5', 'x % 2']);
    const selectedOption = ref('');
    const quizFeedback = ref('');
    const currentChallenge = ref(null);
    const targetOutput = ref(16);
    const powerUps = ref([
      { name: 'Hint', action: () => showHint() },
      { name: 'Skip', action: () => skipChallenge() },
      { name: 'Double Points', action: () => doublePoints() },
    ]);

    // Sounds for different actions
    const soundEffects = {
      drop: new Audio('/sounds/drop.mp3'),
      success: new Audio('/sounds/success.mp3'),
      error: new Audio('/sounds/error.mp3'),
      challengeComplete: new Audio('/sounds/challenge-complete.mp3'),
    };

    let draggedBlock = null;

    const dragStart = (block) => {
      draggedBlock = block;
      soundEffects.drop.play();
    };

    const dropBlock = () => {
      if (draggedBlock && blocks.value.length < maxBlocks.value) {
        blocks.value.push(draggedBlock);
        draggedBlock = null;
        soundEffects.drop.play();
        calculateOutput();
      }
    };

    const runCode = () => {
      try {
        codeOutput.value = new Function('input', codeSnippet.value)(input.value);
        if (codeOutput.value === targetOutput.value) {
          soundEffects.success.play();
        } else {
          soundEffects.error.play();
        }
      } catch (e) {
        codeOutput.value = 'Error: Invalid code!';
        soundEffects.error.play();
      }
    };

    const submitQuizAnswer = () => {
      if (selectedOption.value === 'x * 2') {
        quizFeedback.value = 'Correct!';
        soundEffects.success.play();
      } else {
        quizFeedback.value = 'Incorrect, try again.';
        soundEffects.error.play();
      }
    };

    const solveChallenge = () => {
      if (currentChallenge.value) {
        alert('Challenge Solved!');
        currentChallenge.value = null;
        soundEffects.challengeComplete.play();
      }
    };

    const showHint = () => {
      alert('Here is a hint for you!');
    };

    const skipChallenge = () => {
      currentChallenge.value = null;
      alert('Challenge Skipped!');
    };

    const doublePoints = () => {
      alert('Points doubled for this round!');
    };

    const usePowerUp = (tool) => {
      tool.action();
    };

    // Calculate the output after applying all blocks
    const calculateOutput = () => {
      let tempResult = input.value;
      for (const block of blocks.value) {
        tempResult = block.operation(tempResult);
      }
      result.value = tempResult;
      if (result.value === targetOutput.value) {
        soundEffects.success.play();
      }
    };

    return {
      blocks,
      maxBlocks,
      input,
      result,
      codeSnippet,
      codeOutput,
      quizOptions,
      selectedOption,
      quizFeedback,
      currentChallenge,
      targetOutput,
      powerUps,
      dragStart,
      dropBlock,
      runCode,
      submitQuizAnswer,
      solveChallenge,
      usePowerUp,
      calculateOutput,
    };
  },
});
</script>

<style scoped>
/* Enhanced game styles with dark theme, animations, and responsive design */
.game-lobby {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 100vh;
  background-color: #1a1a1a; /* Dark background color */
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  overflow-y: auto;
}

.main-area {
  flex: 1;
  min-width: 300px;
  max-width: 65%;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-panel,
.tools-panel {
  flex: 0 0 30%;
  min-width: 200px;
  background-color: #333333; /* Dark panel background */
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.panel-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ffffff; /* White text color */
  font-weight: 700;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.drag-drop-area,
.code-area,
.quiz-area {
  background-color: #333333; /* Dark panel background */
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drag-drop-area h3,
.code-area h3,
.quiz-area h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #ffffff; /* White text color */
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
  color: #ffffff; /* White text color */
  background-color: #555555; /* Dark background */
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  font-size: 14px;
}

.field-area {
  display: flex;
  gap: 10px;
  min-height: 60px;
  padding: 10px;
  border: 2px dashed #4a90e2;
  border-radius: 8px;
  background-color: #2b2b2b; /* Dark background */
  transition: background-color 0.3s, border-color 0.3s;
  overflow-x: auto; /* Prevents clipping by allowing horizontal scrolling */
}

.field-area:hover {
  background-color: #3a3a3a; /* Dark hover effect */
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
}

.field-block:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(255, 193, 7, 0.3);
}

.placeholder-block {
  width: 100px;
  height: 40px;
  background-color: #555555; /* Dark background */
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #bbbbbb; /* Lighter text for placeholder */
  border: 1px dashed #888888;
}

.output-arrow {
  font-size: 24px;
  color: #bbbbbb; /* Lighter arrow color */
}

.challenges{
  color: #ffffff;
}
textarea {
  width: 90%;
  height: 100px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #888888; /* Dark border */
  background-color: #2b2b2b; /* Dark background */
  color: #ffffff; /* White text */
  margin-bottom: 10px;
  font-family: 'Roboto', sans-serif;
}

button {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: background-color 0.3s;
  margin-top: 10px;
}

button:hover {
  background-color: #357abd;
}

.quiz-option {
  margin-bottom: 10px;
  color: #ffffff; /* White text color for quiz options */
}

.quiz-feedback {
  margin-top: 10px;
  font-weight: 700;
  color: #50c878;
}

.power-ups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.power-ups button {
  background-color: #50c878;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.power-ups button:hover {
  background-color: #3dae66;
  transform: scale(1.05);
}
</style>

