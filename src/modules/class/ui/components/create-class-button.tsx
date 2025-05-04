"use client";

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useState } from "react";

export const CreateClassButton = () => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState(""); // optional input for future use
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const res = await fetch("/api/class/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        className,
        description,
      }),
    });

    if (res.ok) {
      alert("Class created!");
      setOpen(false);
      setClassName("");
      setDescription("");
    } else {
      alert("Error creating class");
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="rounded-full"
      >
        <PlusIcon className="w-4 h-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Create New Class</h2>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class Name"
              className="w-full border px-3 py-2 mb-3 rounded"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="(Optional) Description"
              className="w-full border px-3 py-2 mb-3 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}