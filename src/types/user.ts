/**
 * User Types
 * Re-export từ index + thêm types mở rộng
 */

export type UserRole = "USER" | "CREATOR" | "ADMIN";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** User public profile (dùng trong trang công khai) */
export interface PublicUserProfile {
  id: string;
  name?: string | null;
  image?: string | null;
  username?: string | null;
}

/** User session (từ NextAuth) */
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

/** Form đăng ký */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/** Form đăng nhập */
export interface LoginInput {
  email: string;
  password: string;
}
