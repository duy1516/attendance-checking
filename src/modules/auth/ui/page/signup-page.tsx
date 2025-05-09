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
  const router = useRouter();

  // Updated signup function from your component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // No need to manually store token as it's in the cookie now
      router.push("/"); // Redirect to home
    } else {
      setMessage(data.error || "Something went wrong");
    }
  };
  return (
    <div className="flex items-center justify-center">
      <div className="bg-black bg-opacity-10 p-10 rounded-3xl w-[1100px] h-[700px] shadow-xl">
        <p className="text-3xl font-bold text-center mb-2">Create your account</p>
        <p className="text-center text-xs mb-6">
          Already have an account? <a href="/sign-in" className="underline">Log in</a>
        </p>

        <div>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="What should we call you?"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
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
                className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
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
                className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select your role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <Button type="submit" className="p-2 rounded-xl mt-6">
              Sign Up
            </Button>
            {message && <p className="text-sm mt-2 text-center">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
