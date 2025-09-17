// ------------------------------------------------------------------------------------------------
// 公式の Authentication utilities をベースに定義
// https://reactrouter.com/api/framework-conventions/server-modules#authentication-utilities
// ------------------------------------------------------------------------------------------------

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ------------------------------------------------------------------------------------------------
// 環境変数と設定
// ------------------------------------------------------------------------------------------------

// 環境変数のチェック（本番環境では異なるシークレットを使用することを推奨）
const ID_TOKEN_SECRET = process.env.ID_TOKEN_SECRET || "ID_TOKEN_SECRET";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "REFRESH_TOKEN_SECRET";

// トークン設定の定数
const TOKEN_CONFIG = {
  ID_TOKEN_EXPIRY: "1d",
  REFRESH_TOKEN_EXPIRY: "7d",
  BCRYPT_ROUNDS: 10,
} as const;

// ------------------------------------------------------------------------------------------------
// 型定義
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
};

export type UserWithAuth = User & {
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

export type RefreshResult =
  | {
      readonly ok: true;
      readonly idToken: string;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

// JWTペイロードの型定義
type IdTokenPayload = User & jwt.JwtPayload;
type RefreshTokenPayload = {
  id: UserId;
  type: "refresh";
} & jwt.JwtPayload;

// ------------------------------------------------------------------------------------------------
// パスワード関連のユーティリティ
// ------------------------------------------------------------------------------------------------

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, TOKEN_CONFIG.BCRYPT_ROUNDS);
}

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ------------------------------------------------------------------------------------------------
// トークン関連のユーティリティ
// ------------------------------------------------------------------------------------------------

export function createIdToken(user: User): string {
  return jwt.sign(user, ID_TOKEN_SECRET, {
    expiresIn: TOKEN_CONFIG.ID_TOKEN_EXPIRY,
  });
}

export function verifyIdToken(token: string): User {
  try {
    const payload = jwt.verify(token, ID_TOKEN_SECRET) as IdTokenPayload;

    // ペイロードの型チェック
    if (!payload.id || !payload.name || !payload.email) {
      throw new Error("Invalid token payload structure");
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

export function createRefreshToken(user: Pick<User, "id">): string {
  return jwt.sign({ id: user.id, type: "refresh" }, REFRESH_TOKEN_SECRET, {
    expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyRefreshToken(token: string): Pick<User, "id"> {
  try {
    const payload = jwt.verify(
      token,
      REFRESH_TOKEN_SECRET
    ) as RefreshTokenPayload;

    // ペイロードの型チェック
    if (!payload.id || payload.type !== "refresh") {
      throw new Error("Invalid refresh token payload");
    }

    return { id: payload.id };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw new Error("Refresh token verification failed");
  }
}

// ------------------------------------------------------------------------------------------------
// ダミーデータとその初期化（開発用）
// ------------------------------------------------------------------------------------------------

// 実際の実装ではデータベースを使用
const users: UserWithAuth[] = [];

/**
 * ダミーユーザーの初期化
 * 開発環境でのみ使用することを推奨
 */
async function initializeUsers(): Promise<void> {
  const hashedPassword = await hashPassword("valid@valid.com"); // 開発用のダミーパスワード

  users.push({
    id: "1" as UserId,
    name: "Hippo" as UserName,
    email: "valid@valid.com",
    auth: {
      userId: "1" as UserId,
      hashedPassword,
    },
  });
}

// アプリケーション起動時に実行
initializeUsers().catch(console.error);

// ------------------------------------------------------------------------------------------------
// 認証関連の主要関数
// ------------------------------------------------------------------------------------------------

/**
 * ユーザーログイン処理
 * Production では、データベースから取得するなどの処理を行うようにしてください
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const user = users.find((u) => u.email === email);

    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合も同じエラーメッセージを返す
      return { ok: false, error: "Invalid credentials" };
    }

    // Sign Up 時にパスワードをハッシュ化して保存する場合
    const isValid = await verifyPassword(password, user.auth.hashedPassword);
    if (!isValid) {
      return { ok: false, error: "Invalid credentials" };
    }

    // auth情報を除外したユーザー情報
    const userWithoutAuth: User = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const idToken = createIdToken(userWithoutAuth);
    const refreshToken = createRefreshToken({ id: user.id });

    return {
      ok: true,
      idToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { ok: false, error: "An error occurred during login" };
  }
}

/**
 * トークンリフレッシュ処理
 */
export async function refresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const { id: userId } = verifyRefreshToken(refreshToken);

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { ok: false, error: "User not found" };
    }

    // auth情報を除外したユーザー情報
    const userWithoutAuth: User = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const idToken = createIdToken(userWithoutAuth);

    return {
      ok: true,
      idToken,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Token refresh failed" };
  }
}
