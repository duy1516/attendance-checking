"use client";

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useState } from "react";

export const CreateClassButton = () => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl w-full max-w-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Create New Class</h2>
            <div>
              <p>Class name (required)</p>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Enter class name"
                className="w-full h-10 border px-3 py-2 mb-3 rounded-xl"
              />
            </div>
            <div>
              <p>Description</p>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="w-full border px-3 py-2 mb-3 rounded-xl resize-none"
              />
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setClassName("");
                  setDescription("");
                }}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}