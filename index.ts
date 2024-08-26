import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let games = {}; // In-memory store for games

app.get('/games', (req, res) => {
    const gameList = Object.keys(games).map((id) => ({
        gameId: id,
        playerCount: games[id].players.length,
    }));
    res.json(gameList);
});

app.post('/game/create', (req, res) => {
    console.log("Create game")
    const { playerName } = req.body;
    const gameId = generateGameId();
    games[gameId] = {
        players: [{ id: generatePlayerId(), name: playerName }],
        state: {
            input: generateInput(),
            targetOutput: generateTargetOutput(),
        },
    };
    res.json({ gameId, ...games[gameId].state });
});

app.post("/game/join", (req, res) => {
    const { gameId, playerId } = req.body;
    console.log(`Join game ${gameId} as player ${playerId}`)
    console.log(games)
    if (games[gameId]) {
        games[gameId].players.push(playerId);
        res.json(games[gameId].state);
    } else {
        res.status(404).json({ error: "Game not found" });
    }
});

app.post("/game/leave", (req, res) => {
    const { gameId, playerId } = req.body;
    if (games[gameId]) {
        games[gameId].players = games[gameId].players.filter((p) => p !== playerId);
        res.json({ message: "Player removed" });
    } else {
        res.status(404).json({ error: "Game not found" });
    }
});

app.delete("/game/:id", (req, res) => {
    const { id } = req.params;
    if (games[id]) {
        delete games[id];
        res.json({ message: "Game deleted" });
    } else {
        res.status(404).json({ error: "Game not found" });
    }
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// WebSocket Server setup
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log('New client connected');
  
    ws.on('message', message => {
      const { gameId, playerId, move } = JSON.parse(message.toString());
  
      if (!games[gameId]) {
        games[gameId] = { players: [] };
      }
  
      if (games[gameId].players.length < 2 && !games[gameId].players.includes(playerId)) {
        games[gameId].players.push(playerId);
        ws.send(JSON.stringify({ type: 'playerCount', count: games[gameId].players.length }));
      }
  
      // Broadcast the move to the other player
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN && games[gameId].players.includes(playerId)) {
          client.send(JSON.stringify({ move, playerId }));
        }
      });
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    //   for (const gameId in games) {
    //     games[gameId].players = games[gameId].players.filter(player => player !== playerId);
    //     if (games[gameId].players.length === 0) {
    //       delete games[gameId]; // Remove the game if no players are left
    //     }
    //   }
    });
  });



function generateGameId() {
    return Math.random().toString(36).substring(2, 15);
}

function generateInput() {
    return Math.floor(Math.random() * 10) + 1;
}

function generateTargetOutput() {
    return Math.floor(Math.random() * 100) + 10;
}

function generatePlayerId() {
    return Math.random().toString(36).substring(2, 9);
}