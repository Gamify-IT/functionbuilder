import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import MainPage from './MainPage.vue';
import Game from './Game.vue';
import LambdaGame from './LambdaGame.vue';
import StringGame from './StringGame.vue';
import EnhancedGame from './EnhancedGame.vue'; // Import the EnhancedGame component

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage,
  },
  {
    path: '/game/:gameId', // Dynamic route for Algebra game
    name: 'AlgebraGame',
    component: Game,
  },
  {
    path: '/lambda-game/:gameId', // Dynamic route for Lambda game
    name: 'LambdaGame',
    component: LambdaGame,
  },
  {
    path: '/string-game/:gameId', // Dynamic route for String game
    name: 'StringGame',
    component: StringGame,
  },
  {
    path: '/enhanced-game/:gameId', // Dynamic route for Enhanced game
    name: 'EnhancedGame',
    component: EnhancedGame,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
