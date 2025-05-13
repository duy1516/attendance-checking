"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
      const res = await fetch("/api/auth/login", {
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
      <div className="bg-black bg-opacity-10 p-10 rounded-3xl w-[1000px] h-[600px] shadow-xl">
        <p className="text-3xl font-bold text-center mb-2">Log in</p>
        <p className="text-center text-xs mb-6">
          Never been here? <a href="/signup" className="underline">Sign up</a>
        </p>
        <div className='mt-20'>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-[800px] h-10 border p-2 my-2 rounded-xl"
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
                className="w-[800px] h-10 border p-2 my-2 rounded-xl"
                required
              />
            </div>
            <Button type="submit" className="p-2 rounded-xl mt-20 w-[100px] h-[40px]">
              Log in
            </Button>
            {message && <p className="text-sm mt-2 text-center">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
