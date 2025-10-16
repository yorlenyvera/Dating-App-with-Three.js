"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import Scene from "./components/scene/Scene";

type ChatMessage = {
  id: string;
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showMessages, setShowMessages] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: input.trim() },
    ]);
    setInput("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaFocus = () => {
    setShowMessages(true);
  };

  return (
    <div className="fixed inset-0 bg-gray-900">
      <Scene />

      <div className="fixed inset-0 flex flex-col items-center pt-4 pb-4 safe-area-inset pointer-events-none">
        {/* Messages */}
        {showMessages && (
          <div className="w-full max-w-2xl flex-1 overflow-y-auto px-4 pointer-events-auto flex flex-col">
            <div className="flex items-center justify-end py-3">
              <button
                onClick={() => setShowMessages(false)}
                className="px-3 py-1 bg-gray-800 text-white/70 rounded text-sm"
              >
                Close
              </button>
            </div>
            <div className="space-y-6 pb-6 pt-6">
              {messages.map((msg) => (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[95%] rounded-lg px-6 py-5 text-lg bg-blue-600 text-white">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={`w-full max-w-2xl px-4 pointer-events-auto ${showMessages ? "pt-2" : "mt-auto"}`}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleTextareaFocus}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded resize-none focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
