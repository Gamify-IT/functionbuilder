<template>
<router-view></router-view>
  <div class="main-page">
    <h1>Join a Room</h1>

    <div v-if="rooms.length > 0" class="rooms-list">
      <ul>
        <li v-for="room in rooms" :key="room.gameId" class="room-item">
          <router-link :to="`/game/${room.gameId}`">
            Room ID: {{ room.gameId }} ({{ room.playerCount }} Player{{
              room.playerCount > 1 ? "s" : ""
            }})
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No rooms available. Create one below!</p>
    </div>

    <div class="create-room">
      <h2>Create a New Room</h2>
      <form @submit.prevent="createRoom">
        <label for="name">Your Name:</label>
        <input type="text" v-model="playerName" id="name" required />

        <button type="submit">Create Room</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "MainPage",
  setup() {
    const rooms = ref([]);
    const playerName = ref("");
    const router = useRouter();

    const fetchRooms = async () => {
      const response = await fetch("/api/games");
      if (response.ok) {
        rooms.value = await response.json();
      }
    };

    const createRoom = async () => {
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerName: playerName.value }),
      });
      if (response.ok) {
        const { gameId } = await response.json();
        router.push(`/game/${gameId}`);
      }
    };

    onMounted(() => {
      fetchRooms();
    });

    return { rooms, playerName, createRoom };
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
