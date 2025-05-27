"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const JoinClassButton = () => {
  const [open, setOpen] = useState(false);
  const [classLink, setClassLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleJoin = async () => {
    setLoading(true);
    try {
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
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        closeModal();
      } else {
        setMessage(data.error || "Failed to join class");
      }
    } catch (error) {
      console.error("Join class failed:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setClassLink("");
    setMessage("");
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">Join New Class</h2>

            <div className="mb-4">
              <label htmlFor="classLink" className="block text-sm mb-1">
                Class code (required)
              </label>
              <input
                id="classLink"
                value={classLink}
                onChange={(e) => setClassLink(e.target.value)}
                placeholder="Enter class code"
                className="border rounded p-2 w-full"
              />
            </div>

            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={closeModal}
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
              <p className="mt-3 text-sm text-red-500 text-center">{message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
