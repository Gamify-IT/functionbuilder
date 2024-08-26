import { createRouter, createWebHistory } from 'vue-router';
import MainPage from './MainPage.vue';
import Game from './Game.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MainPage,
  },
  {
    path: '/game/:gameId',
    name: 'Game',
    component: Game,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
