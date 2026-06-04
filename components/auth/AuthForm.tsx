"use client";

import { useState, FC, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  type: "signin" | "signup";
  showGoogle?: boolean;
}

const AuthFormInner: FC<AuthFormProps> = ({
  type: initialType,
  showGoogle = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [type, setType] = useState<"signin" | "signup">(initialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleType = () => {
    setType(type === "signin" ? "signup" : "signin");
    setError("");
    setHint("");
  };

  async function checkEmailHint(value: string) {
    if (!value.includes("@")) return;
    try {
      const res = await fetch(
        `/api/auth/check-email?email=${encodeURIComponent(value.trim().toLowerCase())}`
      );
      const data = await res.json();
      if (!data.exists) {
        setHint("");
        return;
      }
      if (type === "signin") {
        if (!data.hasPassword && data.hasGoogle) {
          setHint("This email uses Google sign-in. Continue with Google below, or sign up to add a password.");
        } else if (data.hasPassword) {
          setHint("Account found — enter your password to sign in.");
        }
      } else {
        if (data.hasPassword) {
          setHint("Account already exists. Switch to Sign In.");
        } else if (data.hasGoogle) {
          setHint("You signed up with Google. Create a password here to also sign in with email.");
        }
      }
    } catch {
      setHint("");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHint("");

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (type === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: normalizedEmail, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) {
            setType("signin");
          }
          throw new Error(data.error || "Signup failed");
        }

        if (data.linked) {
          setHint(data.message);
        }

        const signInRes = await signIn("credentials", {
          redirect: false,
          email: normalizedEmail,
          password,
        });
        if (signInRes?.error) throw new Error(signInRes.error);
        router.push(callbackUrl);
      } else {
        const checkRes = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(normalizedEmail)}`
        );
        const check = await checkRes.json();

        if (check.exists && !check.hasPassword && check.hasGoogle) {
          setError("This account uses Google. Sign in with Google, or add a password via Sign Up.");
          setLoading(false);
          return;
        }

        const res = await signIn("credentials", {
          redirect: false,
          email: normalizedEmail,
          password,
        });

        if (res?.error) {
          if (check.exists && check.hasPassword) {
            setError("Incorrect password. Try again or use Google if linked.");
          } else if (!check.exists) {
            setError("No account found. Sign up first.");
          } else {
            setError("Invalid email or password.");
          }
        } else {
          router.push(callbackUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-2 text-center">
        {type === "signup" ? "Create Account" : "Welcome Back"}
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {type === "signup"
          ? "Join with email or Google"
          : "Sign in with email or Google"}
      </p>

      {showGoogle && (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 mb-4"
            onClick={handleGoogleLogin}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "signup" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => checkEmailHint(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
        />

        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
        />

        {hint && <p className="text-amber-700 text-sm bg-amber-50 p-2 rounded">{hint}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading
            ? type === "signup"
              ? "Creating account…"
              : "Signing in…"
            : type === "signup"
              ? "Sign Up with Email"
              : "Sign In with Email"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        {type === "signup" ? (
          <>
            Already have an account?{" "}
            <button type="button" onClick={toggleType} className="text-orange-600 font-medium hover:underline">
              Sign In
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button type="button" onClick={toggleType} className="text-orange-600 font-medium hover:underline">
              Sign Up
            </button>
          </>
        )}
      </p>
    </div>
  );
};

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const AuthForm: FC<AuthFormProps> = (props) => (
  <Suspense fallback={<div className="text-center py-20">Loading…</div>}>
    <AuthFormInner {...props} />
  </Suspense>
);

export default AuthForm;
