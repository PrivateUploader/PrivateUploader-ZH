// Composables
import { createRouter, createWebHistory, Router } from "vue-router";
import { useUserStore } from "@/store/user";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "/",
        name: "Dashboard",
        component: () => import("@/views/Home.vue")
      },
      {
        path: "/dashboard",
        name: "Dashboard Redirect",
        redirect: "/"
      },
      {
        path: "/gallery",
        name: "Personal Gallery",
        component: () => import("@/views/Gallery.vue"),
        children: [
          {
            path: ":page",
            name: "Personal Gallery Page",
            component: () => import("@/views/Gallery.vue")
          }
        ]
      },
      {
        path: "/collections",
        name: "Collections",
        component: () => import("@/views/Collections/Home.vue")
      },
      {
        path: "/collections/:id/:page?",
        name: "Collection Item",
        component: () => import("@/views/Collections/Item.vue")
      },
      {
        path: "/settings",
        name: "Settings",
        component: () => import("@/views/Settings/Settings.vue"),
        redirect: "/settings/dashboard",
        children: [
          {
            path: "dashboard",
            name: "Dashboard Settings",
            component: () => import("@/views/Settings/Home.vue")
          },
          {
            path: "security",
            name: "Security",
            component: () => import("@/views/Settings/Security.vue")
          },
          {
            path: "clients",
            name: "Setup",
            component: () => import("@/views/Settings/Setup.vue")
          },
          {
            path: "about",
            name: "About",
            component: () => import("@/views/Settings/About.vue")
          }
        ]
      },
      {
        path: "/autoCollect",
        name: "AutoCollects",
        component: () => import("@/views/AutoCollects/Home.vue")
      },
      {
        path: "/autoCollect/:id",
        name: "AutoCollect",
        component: () => import("@/views/AutoCollects/Item.vue")
      },
      {
        path: "/notes",
        name: "Notes Workspaces Redirect",
        redirect: "/workspaces"
      },
      {
        path: "/notes/:id",
        name: "Note",
        redirect: (to: any) => `/workspaces/notes/${to.params.id}`
      },
      {
        path: "/workspaces",
        name: "Workspaces",
        component: () => import("@/views/Workspaces/Home.vue")
      },
      {
        path: "/workspaces/notes/:id",
        name: "Workspace Item",
        component: () => import("@/views/Workspaces/Item.vue")
      },
      {
        path: "/users",
        name: "Users",
        component: () => import("@/views/User/Home.vue")
      },
      {
        path: "/u/:username",
        name: "User",
        component: () => import("@/views/User/User.vue")
      },
      {
        path: "/starred",
        name: "Starred",
        component: () => import("@/views/Starred.vue")
      },
      {
        path: "/test",
        name: "Test",
        component: () => import("@/views/Test.vue")
      },
      // Unauthenticated
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/Auth/Login.vue")
      },
      {
        path: "/register/:key?",
        name: "Register",
        component: () => import("@/views/Auth/Register.vue")
      },
      {
        path: "/home",
        name: "Home",
        component: () => import("@/views/Auth/Home.vue")
      },
      {
        path: "/policies/content",
        name: "Content Policy",
        component: () => import("@/views/Policies/Content.vue")
      },
      {
        path: "/:pathMatch(.*)",
        name: "404",
        component: () => import("@/views/Errors/404.vue")
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from) => {
  const user = useUserStore();
  if (
    !user.user &&
    ![
      "Login",
      "Home",
      "Register",
      "404",
      "Collection Item",
      "Content Policy"
    ].includes(to.name as string)
  ) {
    console.log("Redirecting to login");
    return { name: "Home" };
  } else if (
    user.user &&
    ["Home", "Login", "Register"].includes(to.name as string)
  ) {
    console.log("Redirecting to dashboard");
    return { name: "Dashboard" };
  }
});

export default router;
