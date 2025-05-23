"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export const JoinClassButton = () => {
  const [open, setOpen] = useState(false);
  const [classLink, setClassLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    const res = await fetch("/api/class/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classLink }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Successfully joined!");
      setOpen(false);
      setClassLink("");
      setMessage("");
    } else {
      setMessage(data.error);
    }

    setLoading(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="rounded-full border-0"
      >
        <PlusIcon className="w-4 h-4" />
      </Button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl w-full max-w-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Join New Class</h2>
            <div>
              <p>Class code (required)</p>
              <input
                value={classLink}
                onChange={(e) => setClassLink(e.target.value)}
                placeholder="Enter class code"
                className="border rounded p-2 w-full mb-2"
              />
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setClassLink("");
                  setMessage("");
                }}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleJoin}
                disabled={loading}
                className="px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join"}
              </Button>
            </div>
            {message && (
              <p className="mt-2 text-sm text-red-500 text-center">{message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
