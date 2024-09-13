<template>
  <div class="main-page">
    <!-- Animated Background -->
    <div class="background-animation"></div>

    <!-- Main Header -->
    <h1 class="main-header">Function Builder</h1>

    <!-- Name Input Section -->
    <div class="name-section">
      <h2 class="name-header">What's your name?</h2>
      <div class="player-name-input">
        <input v-model="newPlayerName" id="playerName" placeholder="Enter your name" />
        <button class="set-name-button" @click="setPlayerName">Set</button>
      </div>
    </div>

    <!-- Single Player Game Mode Section -->
    <div class="game-mode-section">
      <h2 class="section-header">Single Player Mode</h2>
      <div class="game-mode-selection">
        <button class="game-mode-button" @click="startSinglePlayer('Algebra')" :disabled="!playerName">Algebra</button>
        <button class="game-mode-button" @click="startSinglePlayer('Lambda')" :disabled="!playerName">Lambda Functions</button>
        <button class="game-mode-button" @click="startSinglePlayer('Strings')" :disabled="!playerName">String Manipulation</button>
        <button class="game-mode-button" @click="startSinglePlayer('Enhanced')" :disabled="!playerName">Enhanced Game</button>
      </div>
    </div>

    <!-- Multiplayer Section -->
    <div class="multiplayer-section">
      <h2 class="section-header">Multiplayer</h2>
      <div class="multiplayer-container">
        <!-- Create Room Form -->
        <div class="create-room">
          <h3>Create a New Room</h3>
          <form @submit.prevent="createRoom">
            <label for="roomName">Room Name:</label>
            <input v-model="roomName" id="roomName" placeholder="Enter room name" required />

            <label for="gameMode">Select Game Mode (Multiplayer):</label>
            <select v-model="selectedMode" id="gameMode" required>
              <option disabled value="">Please select a mode</option>
              <option value="Algebra">Algebra</option>
              <option value="Lambda">Lambda Functions</option>
              <option value="Strings">String Manipulation</option>
              <option value="Enhanced">Enhanced Game</option>
            </select>

            <button class="create-room-button" type="submit" :disabled="!selectedMode || !playerName || !roomName">
              Create Room
            </button>
          </form>
        </div>

        <!-- Room List -->
        <div class="rooms-list">
          <h3>Available Rooms</h3>
          <ul>
            <li v-for="room in rooms" :key="room.gameId" class="room-item">
              <a @click.prevent="joinRoom(room.gameId, room.mode)">
                {{ room.roomName }} ({{ room.playerCount }} Player{{ room.playerCount > 1 ? "s" : "" }}) - Mode: {{ room.mode }}
              </a>
            </li>
          </ul>
          <p v-if="rooms.length === 0">No rooms available. Create one!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Room {
  gameId: string;
  playerCount: number;
  mode: string;
  roomName: string;
}

export default defineComponent({
  name: 'MainPage',
  setup() {
    const rooms = ref<Room[]>([]);
    const playerName = ref(localStorage.getItem('playerName') || ''); // Load saved name from localStorage
    const newPlayerName = ref(playerName.value); // Separate field for the new name input
    const roomName = ref(''); // New room name
    const selectedMode = ref('');
    const router = useRouter();

    const setPlayerName = () => {
      playerName.value = newPlayerName.value;
      localStorage.setItem('playerName', playerName.value); // Save to localStorage
    };

    const fetchRooms = async () => {
      const response = await fetch('http://localhost:3000/roomState');
      if (response.ok) {
        const data = await response.json();
        rooms.value = data.map((room) => ({
          gameId: room.roomId,
          roomName: room.roomName,
          playerCount: room.playerCount,
          mode: room.mode,
        }));
      }
    };

    const startSinglePlayer = (mode: string) => {
      router.push(`/game/single?mode=${mode}&name=${playerName.value}`);
    };

    const createRoom = async () => {
      const response = await fetch('http://localhost:3000/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName: playerName.value, roomName: roomName.value, mode: selectedMode.value }),
      });
      if (response.ok) {
        const { roomId } = await response.json();
        rooms.value.push({ gameId: roomId, roomName: roomName.value, playerCount: 1, mode: selectedMode.value });
        router.push(`/game/${roomId}?mode=${selectedMode.value}&name=${playerName.value}`);
      }
    };

    const joinRoom = (gameId: string, mode: string) => {
      router.push(`/game/${gameId}?mode=${mode}&name=${playerName.value}`);
    };

    onMounted(() => {
      fetchRooms();
    });

    return { rooms, playerName, newPlayerName, roomName, selectedMode, setPlayerName, startSinglePlayer, createRoom, joinRoom };
  },
});
</script>

<style scoped>
/* General Styles */
.main-page {
  position: relative;
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #fff;
  background: rgba(31, 31, 31, 0.9);
  border-radius: 15px;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1;
}

h1.main-header {
  text-align: center;
  font-size: 3em;
  margin-bottom: 30px;
  color: #ffc107;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

/* Name Input Section */
.name-section {
  margin-bottom: 40px;
  text-align: center;
}

.name-header {
  font-size: 1.8em;
  margin-bottom: 15px;
  color: #ffc107;
}

.player-name-input {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.player-name-input input {
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ffc107;
  background-color: #1f1f1f;
  color: #fff;
  font-size: 1.1em;
  width: 250px;
}

.set-name-button {
  background-color: #ffc107;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s;
}

.set-name-button:hover {
  background-color: #e0a800;
  transform: scale(1.05);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

/* Single Player Game Mode Section */
.game-mode-section {
  margin-bottom: 40px;
}

.section-header {
  font-size: 1.8em;
  margin-bottom: 15px;
  text-align: center;
  color: #00bfff;
}

.game-mode-selection {
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.game-mode-button {
  padding: 15px 25px;
  font-size: 1.2em;
  background-color: #00bfff;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.game-mode-button:hover {
  background-color: #0088cc;
  transform: translateY(-3px);
}

/* Multiplayer Section */
.multiplayer-section {
  margin-top: 40px;
}

.multiplayer-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.create-room, .rooms-list {
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  width: 48%;
}

.create-room h3, .rooms-list h3 {
  color: #ffc107;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.create-room label, .rooms-list ul {
  color: #fff;
}

.create-room input, .create-room select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 2px solid #00bfff;
  background-color: #1f1f1f;
  color: #fff;
}

.create-room-button {
  padding: 12px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s, transform 0.2s;
}

.create-room-button:hover {
  background-color: #218838;
  transform: translateY(-3px);
}

.rooms-list ul {
  list-style: none;
  padding: 0;
}

.rooms-list li {
  background-color: #1f1f1f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: background-color 0.3s;
}

.rooms-list li:hover {
  background-color: #00bfff;
}

.rooms-list a {
  color: #ffc107;
  text-decoration: none;
  font-size: 1.1em;
  transition: color 0.3s;
}

.rooms-list a:hover {
  color: #fff;
}

/* Background Animation */
.background-animation {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 10%, transparent 10%);
  background-size: 100px 100px;
  animation: rotateAnimation 30s infinite linear;
  z-index: 0;
  pointer-events: none; /* Disable pointer events to ensure it's not clickable */
}

@keyframes rotateAnimation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
