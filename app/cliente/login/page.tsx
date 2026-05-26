import { redirect } from "next/navigation";

export default function ClienteLoginRedirect() {
  redirect("/login");
}
