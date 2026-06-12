import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthForm } from "@/components/AuthForm";

export default async function RegistroPage() {
  if (await getSession()) redirect("/");
  return <AuthForm mode="register" />;
}
