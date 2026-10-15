import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
