"use client";

import { useState, FC } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  type: "signin" | "signup";
  socialProviders?: { name: string; id: string }[];
}

const AuthForm: FC<AuthFormProps> = ({
  type: initialType,
  socialProviders = [],
}) => {
  const router = useRouter();
  const [type, setType] = useState<"signin" | "signup">(initialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleType = () => {
    setType(type === "signin" ? "signup" : "signin");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "signup") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          }
        );
        const data = await res.json();
        console.log({ data });
        if (!res.ok) throw new Error(data.error || "Signup failed");

        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        console.log({ signInRes });
        if (signInRes?.error) throw new Error(signInRes.error);
        router.push("/dashboard");
      } else {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        console.log({ res });
        if (res?.error) setError(res.error);
        else router.push("/dashboard");
        console.log("last after push to dashbaord");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (providerId: string) => {
    signIn(providerId, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {type === "signup" ? "Sign Up" : "Sign In"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* {type === "signup" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-300"
          />
        )} */}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-300"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-300"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg font-medium transition"
        >
          {loading
            ? type === "signup"
              ? "Signing up..."
              : "Signing in..."
            : type === "signup"
            ? "Sign Up"
            : "Sign In"}
        </button>
      </form>

      {socialProviders.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          {socialProviders.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              onClick={() => handleSocialLogin(p.id)}
            >
              Continue with {p.name}
            </Button>
          ))}
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        {type === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={toggleType}
              className="text-yellow-500 font-medium hover:underline"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={toggleType}
              className="text-yellow-500 font-medium hover:underline"
            >
              Sign Up
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForm;
