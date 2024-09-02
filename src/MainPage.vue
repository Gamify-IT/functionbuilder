<template>
  <div class="main-page">
    <h1>Select Game Mode</h1>
    <!-- Game Mode Selection -->
    <div class="game-mode-selection">
      <button @click="createRoom('Algebra')">Algebra</button>
      <button @click="createRoom('Lambda')">Lambda Functions</button>
      <button @click="createRoom('Strings')">String Manipulation</button>
      <!-- New button for Enhanced Game -->
      <button @click="createRoom('Enhanced')">Enhanced Game</button>
    </div>

    <!-- Room List -->
    <div v-if="rooms.length > 0" class="rooms-list">
      <ul>
        <li v-for="room in rooms" :key="room.gameId" class="room-item">
          <router-link :to="getRoomLink(room)">
            Room ID: {{ room.gameId }} ({{ room.playerCount }} Player{{ room.playerCount > 1 ? "s" : "" }})
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No rooms available. Create one below!</p>
    </div>

    <!-- Create Room Form -->
    <div class="create-room">
      <h2>Create a New Room</h2>
      <form @submit.prevent="createRoom(selectedMode)">
        <label for="name">Room Name:</label>
        <input type="text" v-model="playerName" id="name" required />

        <button type="submit">Create Room</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainPage',
  setup() {
    const rooms = ref([]); // List of rooms
    const playerName = ref(''); // Player's name
    const selectedMode = ref(''); // Track selected mode
    const router = useRouter();

    // Create a new game room
    const createRoom = (mode: string) => {
      selectedMode.value = mode;
      const gameId = generateGameId();
      const newRoom = {
        gameId,
        mode: mode,
        playerCount: 1,
        players: [{ name: playerName.value }],
      };
      rooms.value.push(newRoom);

      if (mode === 'Algebra') {
        router.push(`/game/${gameId}?mode=${mode}`);
      } else if (mode === 'Lambda') {
        router.push(`/lambda-game/${gameId}?mode=${mode}`);
      } else if (mode === 'Strings') {
        router.push(`/string-game/${gameId}?mode=${mode}`);
      } else if (mode === 'Enhanced') {
        router.push(`/enhanced-game/${gameId}?mode=${mode}`);
      }
    };

    // Generate a random game ID
    const generateGameId = () => {
      return Math.random().toString(36).substring(2, 9);
    };

    // Get the link to a room based on its mode
    const getRoomLink = (room) => {
      if (room.mode === 'Algebra') {
        return `/game/${room.gameId}?mode=${room.mode}`;
      } else if (room.mode === 'Lambda') {
        return `/lambda-game/${room.gameId}?mode=${room.mode}`;
      } else if (room.mode === 'Strings') {
        return `/string-game/${room.gameId}?mode=${room.mode}`;
      } else if (room.mode === 'Enhanced') {
        return `/enhanced-game/${room.gameId}?mode=${room.mode}`;
      }
    };

    return { rooms, playerName, createRoom, getRoomLink, selectedMode };
  },
});
</script>

<style scoped>
.main-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.game-mode-selection {
  text-align: center;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}

.rooms-list {
  margin-bottom: 20px;
}

.room-item {
  margin: 10px 0;
  font-size: 16px;
}

.room-item a {
  text-decoration: none;
  color: #007bff;
}

.room-item a:hover {
  text-decoration: underline;
}

.create-room {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.create-room h2 {
  margin-bottom: 10px;
  text-align: center;
}

.create-room form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.create-room label {
  font-weight: bold;
}

.create-room input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.create-room button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.create-room button:hover {
  background-color: #218838;
}
</style>
