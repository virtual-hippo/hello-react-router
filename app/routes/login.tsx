import { Form, redirect, useActionData } from "react-router";
import type { Route } from "./+types/login";

import { login } from "../utils/auth.server.ts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const authResult = await login(email, password);

  if (!authResult.ok) {
    return {
      error: "ログインに失敗しました",
    };
  }

  // クッキーにJWTトークンを設定してリダイレクト
  return redirect("/dashboard", {
    headers: [
      [
        "Set-Cookie",
        `id-token=${authResult.idToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 15}`, // 15分
      ],
      [
        "Set-Cookie",
        `refresh-token=${authResult.refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}`, // 30日
      ],
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
