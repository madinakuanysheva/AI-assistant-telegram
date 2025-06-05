// src/components/InputBar.tsx
import React, { useState } from "react";

type Props = {
  onSend: (text: string) => void;
};

const InputBar: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="p-4 bg-white border-t flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded-xl px-4 py-2 outline-none"
        placeholder="Напиши сообщение..."
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
      >
        Отправить
      </button>
    </div>
  );
};

export default InputBar;
