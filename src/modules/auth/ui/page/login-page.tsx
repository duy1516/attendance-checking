"use client";

import { LoginButton } from "../components/login-button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // No need to manually store token as it's in the cookie now
        router.push("/"); // Redirect to home after login
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex items-center justify-center bg-white">
      <div className="bg-black bg-opacity-10 p-10 rounded-3xl w-[1100px] h-[600px] shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">Log in</h1>
        <p className="text-center text-sm mb-6">
          Never been here? <a href="/sign-up" className="underline">Sign up</a>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-[800px] h-10 border px-3 py-2 mb-3 rounded-xl"
              required
            />
          </div>

          <div className="flex items-center mb-6">
            <input id="stayLoggedIn" type="checkbox" className="mr-2" />
            <label htmlFor="stayLoggedIn" className="text-sm">Stay logged in</label>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring"
          >
            Log In
          </button>
          {message && <p className="text-sm mt-2 text-center">{message}</p>}
        </form>
      </div>
    </div>
  );
}
