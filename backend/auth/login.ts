import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import bcrypt from "bcryptjs";

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
  anonymousId?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email?: string;
    username?: string;
    role: string;
    isAnonymous: boolean;
  };
  token: string;
}

// Logs in a user
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const { email, username, password, anonymousId } = req;

    if (anonymousId) {
      const user = await authDB.queryRow<{
        id: string;
        role: string;
        is_anonymous: boolean;
      }>`
        SELECT id, role, is_anonymous
        FROM users
        WHERE id = ${anonymousId} AND is_anonymous = true
      `;

      if (!user) {
        throw APIError.unauthenticated("Invalid anonymous ID");
      }

      return {
        user: {
          id: user.id,
          role: user.role,
          isAnonymous: user.is_anonymous,
        },
        token: generateToken(user.id),
      };
    }

    if (!email && !username) {
      throw APIError.invalidArgument("Email or username is required");
    }

    if (!password) {
      throw APIError.invalidArgument("Password is required");
    }

    const user = await authDB.queryRow<{
      id: string;
      email: string | null;
      username: string | null;
      password_hash: string;
      role: string;
      is_anonymous: boolean;
    }>`
      SELECT id, email, username, password_hash, role, is_anonymous
      FROM users
      WHERE (email = ${email} OR username = ${username}) AND is_anonymous = false
    `;

    if (!user) {
      throw APIError.unauthenticated("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw APIError.unauthenticated("Invalid credentials");
    }

    return {
      user: {
        id: user.id,
        email: user.email || undefined,
        username: user.username || undefined,
        role: user.role,
        isAnonymous: user.is_anonymous,
      },
      token: generateToken(user.id),
    };
  }
);

function generateToken(userId: string): string {
  // In a real application, you would use a proper JWT library
  // For now, we'll return a simple token
  return Buffer.from(JSON.stringify({ userId, exp: Date.now() + 86400000 })).toString('base64');
}
