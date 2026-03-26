import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Camera, Trash2 } from "lucide-react";

interface AvatarUploadProps {
  imageUrl?: string | null;
  fullName?: string;
  disabled?: boolean;
  onFileSelected?: (file: File, previewUrl: string) => void;
  onClear?: () => void;
  onError?: (message: string) => void;
}

const getInitials = (name?: string) => {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase();
  }

  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
};

const AvatarUpload = ({
  imageUrl,
  fullName,
  disabled = false,
  onFileSelected,
  onClear,
  onError,
}: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState("");

  const initials = useMemo(() => getInitials(fullName), [fullName]);

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      const message = "Please select an image file.";
      setError(message);
      onError?.(message);
      return;
    }

    setError("");
    setImageFailed(false);
    const previewUrl = URL.createObjectURL(file);
    onFileSelected?.(file, previewUrl);
    event.target.value = "";
  };

  const showFallback = !imageUrl || imageFailed;

  const handleOpenFileDialog = () => {
    if (disabled) {
      return;
    }

    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="relative group h-20 w-20">
        {showFallback ? (
          <div className="h-20 w-20 rounded-full border-2 border-gray-200 bg-cyan-50 text-cyan-700 flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>
        ) : (
          <img
            src={imageUrl || ""}
            alt="Profile"
            onError={() => setImageFailed(true)}
            className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
          />
        )}

        <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            title="Clear photo"
            aria-label="Clear photo"
            onClick={onClear}
            disabled={disabled}
            className="h-7 w-7 rounded-full bg-white/95 text-red-600 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          title="Replace photo"
          aria-label="Replace photo"
          onClick={handleOpenFileDialog}
          disabled={disabled}
          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border border-gray-200 bg-white text-cyan-700 shadow-sm flex items-center justify-center hover:bg-cyan-50 transition-colors disabled:opacity-60"
        >
          <Camera className="h-4 w-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleSelectFile}
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-600 max-w-[220px]">{error}</p>}
    </div>
  );
};

export default AvatarUpload;
