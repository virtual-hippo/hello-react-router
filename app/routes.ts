import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_layouts/index.tsx", [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),

    layout("routes/_layouts/auth.tsx", { id: "auth" }, [
      route("dashboard", "routes/dashboard/_layout.tsx", [
        index("routes/dashboard/index.tsx"),
        route("settings", "routes/dashboard/settings.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
