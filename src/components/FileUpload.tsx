import React, { useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onEmojiSelect: (emoji: string) => void;
  onVoiceMessage: (audioBlob: Blob) => void;
  onGifSelect: (gifUrl: string) => void;
  onLocationShare: (location: { lat: number; lng: number; name: string }) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onEmojiSelect,
  onVoiceMessage,
  onGifSelect,
  onLocationShare,
  disabled = false
}) => {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sample GIFs (in a real app, you'd fetch these from a GIF API)
  const sampleGifs = [
    { id: 1, url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Happy' },
    { id: 2, url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Dance' },
    { id: 3, url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Love' },
    { id: 4, url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', title: 'Laugh' },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
        onVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowGifPicker(false);
  };

  const toggleGifPicker = () => {
    setShowGifPicker(!showGifPicker);
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    onGifSelect(gifUrl);
    setShowGifPicker(false);
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd use a geocoding service to get the location name
          onLocationShare({
            lat: latitude,
            lng: longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-yellow-400 hover:bg-gray-700' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {theme === 'dark' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>

      {/* Emoji Button */}
      <button
        onClick={toggleEmojiPicker}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors duration-200 ${
          disabled 
            ? 'text-gray-400 cursor-not-allowed' 
            : theme === 'dark'
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* GIF Button */}
      <button
        onClick={toggleGifPicker}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Location Button */}
      <button
        onClick={handleLocationShare}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* File Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </button>

      {/* Voice Message Button */}
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled
            ? 'text-gray-400 cursor-not-allowed'
            : isRecording
            ? 'text-red-500 bg-red-100'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-8 gap-1">
            {['😊', '😂', '❤️', '👍', '🎉', '🔥', '👋', '🙏', '🤔', '😎', '🎵', '📷', '📱', '💻', '🎮', '🎨'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GIF Picker */}
      {showGifPicker && (
        <div className="absolute bottom-16 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700 w-64">
          <input
            type="text"
            value={gifSearch}
            onChange={(e) => setGifSearch(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full px-2 py-1 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {sampleGifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifSelect(gif.url)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
              >
                <img src={gif.url} alt={gif.title} className="w-full h-24 object-cover rounded" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 