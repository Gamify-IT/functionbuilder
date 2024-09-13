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
    props: (route) => ({ mode: 'Algebra', gameId: route.params.gameId }), // Passing mode as prop
  },
  {
    path: '/lambda-game/:gameId', // Dynamic route for Lambda game
    name: 'LambdaGame',
    component: LambdaGame,
    props: (route) => ({ mode: 'Lambda', gameId: route.params.gameId }), // Passing mode as prop
  },
  {
    path: '/string-game/:gameId', // Dynamic route for String game
    name: 'StringGame',
    component: StringGame,
    props: (route) => ({ mode: 'Strings', gameId: route.params.gameId }), // Passing mode as prop
  },
  {
    path: '/enhanced-game/:gameId', // Dynamic route for Enhanced game
    name: 'EnhancedGame',
    component: EnhancedGame,
    props: (route) => ({ mode: 'Enhanced', gameId: route.params.gameId }), // Passing mode as prop
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
