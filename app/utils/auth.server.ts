// https://reactrouter.com/api/framework-conventions/server-modules#authentication-utilities

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(user: Omit<User, "auth">) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

// ダミーデータと認証関数

type UserId = string & { readonly __brand: "userId" };
type UserName = string & { readonly __brand: "userName" };

type UserAuth = {
  readonly userId: UserId;
  readonly hashedPassword: string;
};

export type User = {
  readonly id: UserId;
  readonly name: UserName;
  readonly email: string;
  readonly auth: UserAuth;
};

export type LoginResult =
  | {
      readonly ok: true;
      readonly idToken: string;
      readonly refreshToken: string;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

const users: User[] = [
  {
    id: "1" as UserId,
    name: "Hippo" as UserName,
    email: "valid@valid.com",
    auth: {
      userId: "1" as UserId,
      hashedPassword: "",
    },
  },
];

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = users.find((u) => u.email === email);
  // return user ? bcrypt.compare(password, user.hashedPassword) : false;

  if (!user) {
    return { ok: false, error: "User not found" };
  }

  //   const isValid = await bcrypt.compare(password, user.auth.hashedPassword);
  //   if (!isValid) {
  //     return { ok: false, error: "Invalid password" };
  //   }

  const userWithoutAuth = { id: user.id, name: user.name, email: user.email };

  // TODO:
  // - token ごとのペイロードを変える
  // - id token は短めにする
  // - refresh token は長めにする
  const idToken = createToken(userWithoutAuth);
  const refreshToken = createToken(userWithoutAuth);

  return {
    ok: true,
    idToken,
    refreshToken,
  };
}
