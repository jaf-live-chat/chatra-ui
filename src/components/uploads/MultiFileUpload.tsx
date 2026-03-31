import { useState, type ChangeEvent } from "react";
import { Files, Loader2 } from "lucide-react";
import type { UploadedFileAsset, UploadMultipleFn } from "../../models/UploadModel";

interface MultiFileUploadProps {
  label?: string;
  hint?: string;
  onUploaded?: (files: UploadedFileAsset[]) => void;
  uploadMultiple: UploadMultipleFn;
}

const MultiFileUpload = ({
  label = "Upload Multiple Files",
  hint = "Choose multiple files",
  onUploaded,
  uploadMultiple,
}: MultiFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileAsset[]>([]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!fileList || fileList.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      const files = Array.from(fileList);
      const response = await uploadMultiple(files);
      setUploadedFiles(response.files);
      onUploaded?.(response.files);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload files.";
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
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Files className="h-4 w-4" />}
        {isUploading ? "Uploading..." : "Select Files"}
        <input type="file" multiple className="hidden" onChange={handleUpload} disabled={isUploading} />
      </label>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {uploadedFiles.length > 0 && (
        <ul className="mt-3 space-y-1">
          {uploadedFiles.map((file) => (
            <li key={file.publicId}>
              <a className="text-xs text-cyan-700 break-all" href={file.url} target="_blank" rel="noreferrer">
                {file.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiFileUpload;
