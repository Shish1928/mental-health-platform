import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import bcrypt from "bcryptjs";

export interface RegisterRequest {
  email?: string;
  username?: string;
  password?: string;
  role?: "student" | "counselor" | "admin";
  isAnonymous?: boolean;
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email?: string;
    username?: string;
    role: string;
    isAnonymous: boolean;
  };
}

// Registers a new user
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    const { email, username, password, role = "student", isAnonymous = false, firstName, lastName, preferredLanguage = "en" } = req;

    if (!isAnonymous && (!email || !password)) {
      throw APIError.invalidArgument("Email and password are required for non-anonymous users");
    }

    if (!isAnonymous && !username) {
      throw APIError.invalidArgument("Username is required for non-anonymous users");
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    try {
      await authDB.exec`BEGIN`;

      const userResult = await authDB.queryRow<{ id: string }>`
        INSERT INTO users (email, username, password_hash, role, is_anonymous)
        VALUES (${email}, ${username}, ${passwordHash}, ${role}, ${isAnonymous})
        RETURNING id
      `;

      if (!userResult) {
        throw APIError.internal("Failed to create user");
      }

      await authDB.exec`
        INSERT INTO user_profiles (user_id, first_name, last_name, preferred_language)
        VALUES (${userResult.id}, ${firstName}, ${lastName}, ${preferredLanguage})
      `;

      await authDB.exec`COMMIT`;

      return {
        user: {
          id: userResult.id,
          email: isAnonymous ? undefined : email,
          username: isAnonymous ? undefined : username,
          role,
          isAnonymous,
        },
      };
    } catch (error) {
      await authDB.exec`ROLLBACK`;
      if (error instanceof Error && error.message.includes("unique")) {
        throw APIError.alreadyExists("User with this email already exists");
      }
      throw error;
    }
  }
);
