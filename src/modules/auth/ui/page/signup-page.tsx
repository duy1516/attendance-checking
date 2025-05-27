"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Handle signup with automatic face recognition linking
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsProcessing(true);

    try {
      // Step 1: Create user account
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok || !signupData.success) {
        setMessage(signupData.error || "Failed to create account");
        setIsProcessing(false);
        return;
      }

      // Step 2: Automatically link to face recognition system
      const linkRes = await fetch("/api/face-recognition/user-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          web_user_id: signupData.user.id,
          name: signupData.user.name,
        }),
      });

      const linkData = await linkRes.json();

      if (!linkRes.ok || !linkData.success) {
        // Account was created but linking failed
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      // Both steps successful
      setMessage("Account created successfully!");
      setTimeout(() => router.push("/"), 2000);

    } catch (error) {
      setMessage("An error occurred during signup");
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <div className="flex items-center justify-center">
      <div className="bg-black bg-opacity-10 p-10 rounded-3xl w-[1000px] h-[600px] shadow-xl">
        <p className="text-3xl font-bold text-center mb-2">Create your account</p>
        <p className="text-center text-xs mb-6">
          Already have an account? <a href="/login" className="underline">Log in</a>
        </p>

        <div>
          <form onSubmit={handleSignup} className="flex flex-col items-center">
            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="What should we call you?"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-[800px] h-10 border p-2 my-2 rounded-xl"
                required
              />
            </div>

            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium mb-1">Email address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-[800px] h-10 border p-2 my-2 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Create your password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-[800px] h-10 border p-2 my-2 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mt-4 mb-1">Select your role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-[800px] h-10 border p-2 my-2 rounded-xl"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="p-2 rounded-xl mt-8 w-[100px] h-[40px]"
            >
              {isProcessing ? "Processing..." : "Sign Up"}
            </Button>

            {message && (
              <p className={`text-sm mt-2 text-center ${message.includes("successfully") ? "text-green-600" : "text-red-600"
                }`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};