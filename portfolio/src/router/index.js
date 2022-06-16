import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Main",
    component: () => import("../views/Main.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
  {
    path: "/skills",
    name: "Skills",
    component: () => import("../views/Skills.vue"),
  },
  {
    path: "/portfolios",
    name: "Portfolio",
    component: () => import("../views/Portfolio.vue"),
  },
  {
    path: "/pairplay",
    name: "Pairplay",
    component: () => import("../views/Pairplay.vue"),
  },
  {
    path: "/unique",
    name: "Unique",
    component: () => import("../views/Unique.vue"),
  },
  {
    path: "/campus",
    name: "Campus",
    component: () => import("../views/Campus.vue"),
  },
  {
    path: "/expereince",
    name: "Experiences",
    component: () => import("../views/Experiences.vue"),
  },
  // {
  //   path: "/about",
  //   name: "about",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  // },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  // history: createWebHistory(),
  routes,
});

export default router;
