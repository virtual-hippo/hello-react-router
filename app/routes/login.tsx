import { Form, redirect, useActionData } from "react-router";
import type { Route } from "./+types/login";

import { login } from "../utils/auth.server.ts";
import { idTokenCookie, refreshTokenCookie } from "~/utils/cookies.server.ts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const idTokenCookieObj = (await idTokenCookie.parse(cookieHeader)) || {};
  const refreshTokenCookieObj =
    (await refreshTokenCookie.parse(cookieHeader)) || {};

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const authResult = await login(email, password);

  if (!authResult.ok) {
    return {
      error: "ログインに失敗しました",
    };
  }

  idTokenCookieObj["id-token"] = authResult.idToken;
  refreshTokenCookieObj["refresh-token"] = authResult.refreshToken;

  // クッキーにJWTトークンを設定してリダイレクト
  return redirect("/dashboard", {
    headers: [
      ["Set-Cookie", await idTokenCookie.serialize(idTokenCookieObj)],
      ["Set-Cookie", await refreshTokenCookie.serialize(refreshTokenCookieObj)],
    ],
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get("Cookie");
  const hasToken = cookie?.includes("auth-token=");

  if (hasToken) {
    return redirect("/dashboard");
  }

  return;
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <div className="login-container">
      <h1>Login</h1>

      <Form method="post" className="login-form">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="border border-gray-500"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="border border-gray-500"
          />
        </div>

        {actionData?.error && (
          <div className="error-message">{actionData.error}</div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </Form>
    </div>
  );
}
