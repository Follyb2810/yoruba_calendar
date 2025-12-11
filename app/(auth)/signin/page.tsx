import AuthForm from "@/components/auth/AuthForm";

export default function SignInPage() {
  return (
    <AuthForm
      type="signin"
      socialProviders={[
        { name: "Google", id: "google" },
        { name: "GitHub", id: "github" },
        { name: "Twitter", id: "twitter" },
      ]}
    />
  );
}
