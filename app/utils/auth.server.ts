// ------------------------------------------------------------------------------------------------
// 公式の Authentication utilities をほぼ流用
// https://reactrouter.com/api/framework-conventions/server-modules#authentication-utilities
// ------------------------------------------------------------------------------------------------

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(user: Omit<User, "auth">) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function verifyToken(token: string): Promise<Omit<User, "auth">> {
  const jwtPayLoad = await jwt.verify(token, JWT_SECRET);
  return jwtPayLoad as Omit<User, "auth">;
}

// ------------------------------------------------------------------------------------------------
// 以下は自前で定義
// ------------------------------------------------------------------------------------------------

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

/**
 *
 * ダミー認証
 * Production では、認証サーバーに問い合わせるなどの処理を行うようにしてください
 *
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { ok: false, error: "User not found" };
  }

  // Sign Up 時にパスワードをハッシュ化して保存する場合
  //   const isValid = await verifyPassword(password, user.auth.hashedPassword);
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
