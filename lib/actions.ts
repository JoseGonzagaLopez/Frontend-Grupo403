"use server";

import { cookies } from "next/headers";

const VALID_PASSWORDS = ["Admin1", "Admin2", "Admin3"];

export async function authenticate(password: string) {
  if (VALID_PASSWORDS.includes(password)) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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

// ── CLIENTE ──────────────────────────────────────────────
export async function loginCustomerAction(customerId: number) {
  const cookieStore = await cookies();
  cookieStore.set("customer_auth_token", String(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  });
}

export async function logOutCustomer() {
  const cookieStore = await cookies();
  cookieStore.delete("customer_auth_token");
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_auth_token");
  return token ? Number(token.value) : null;
}

// ── EMPRESA ──────────────────────────────────────────────
export async function loginBusinessAction(businessId: number) {
  const cookieStore = await cookies();
  cookieStore.set("business_auth_token", String(businessId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  });
}

export async function logOutBusiness() {
  const cookieStore = await cookies();
  cookieStore.delete("business_auth_token");
}

export async function getBusinessSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("business_auth_token");
  return token ? Number(token.value) : null;
}
