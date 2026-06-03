import { redirect } from "next/navigation";

export default function ClienteRegisterRedirect() {
  redirect("/login");
}
