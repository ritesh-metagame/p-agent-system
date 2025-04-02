import { LoginForm } from "@/components/login-form";

export default async function Page() {
  return (
    <div className="flex min-h-svh bg-gradient-to-r from-sky-500 via-30% to-emerald-500 to-90% w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
