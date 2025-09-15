import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/auth";

export type AuthContext = {
  readonly isAuth: boolean;
};

export function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get("Cookie");
  const token = cookie
    ?.split("; ")
    .find((row) => row.startsWith("auth-token="))
    ?.split("=")[1];

  // TODO: auth server での検証
  const isAuth = token === "valid-token";

  if (!isAuth) {
    // トークンが無効な場合
    throw redirect("/login", {
      headers: {
        "Set-Cookie": "auth-token=; Path=/; HttpOnly; Max-Age=0",
      },
    });
  }

  return { isAuth, userName: "Hippo" };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { isAuth } = loaderData;
  console.log("isAuth:", isAuth);

  return (
    <>
      <Outlet />
    </>
  );
}
