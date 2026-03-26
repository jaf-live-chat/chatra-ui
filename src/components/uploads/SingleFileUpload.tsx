import { useState, type ChangeEvent } from "react";
import { FileUp, Loader2 } from "lucide-react";
import uploadService, { type UploadedFileAsset } from "../../services/uploadService";

interface SingleFileUploadProps {
  label?: string;
  hint?: string;
  onUploaded?: (file: UploadedFileAsset) => void;
}

const SingleFileUpload = ({
  label = "Upload File",
  hint = "Choose one file to upload",
  onUploaded,
}: SingleFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const response = await uploadService.uploadSingle(file);
      setUploadedUrl(response.file.url);
      onUploaded?.(response.file);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload file.";
      setError(message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>

      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-cyan-300 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700 hover:bg-cyan-100 transition-colors">
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
        {isUploading ? "Uploading..." : "Select File"}
        <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
      </label>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {uploadedUrl && (
        <a className="mt-2 block text-xs text-cyan-700 break-all" href={uploadedUrl} target="_blank" rel="noreferrer">
          {uploadedUrl}
        </a>
      )}
    </div>
  );
};

export default SingleFileUpload;
