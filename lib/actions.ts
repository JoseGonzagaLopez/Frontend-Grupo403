"use server";

import { cookies } from "next/headers";

const VALID_PASSWORDS = ["Admin1", "Admin2", "Admin3"];

export async function authenticate(password: string) {
  if (VALID_PASSWORDS.includes(password)) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    });
    return { success: true };
  }
  return { success: false };
}

export async function logOut() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth_token");
}
