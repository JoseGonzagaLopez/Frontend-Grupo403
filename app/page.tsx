import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const adminAuthToken = cookieStore.get("admin_auth_token");
  const customerAuthToken = cookieStore.get("customer_auth_token");
  const businessAuthToken = cookieStore.get("business_auth_token");

  if (adminAuthToken) {
    redirect("/dashboard");
  } else if (customerAuthToken) {
    redirect("/cliente");
  } else if (businessAuthToken) {
    redirect("/negocio/dashboard");
  } else {
    redirect("/login");
  }
}