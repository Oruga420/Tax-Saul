import React, { useRef } from 'react';
import { Paperclip, X, FileType, Image as ImageIcon, Video } from 'lucide-react';
import { Attachment } from '../types';

interface FileUploaderProps {
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ attachments, setAttachments }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              mimeType: file.type,
              data: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileType className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden Input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
      />

      {/* Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-slate-400 hover:text-cyan-500 transition-colors rounded-full hover:bg-slate-100"
        title="Add documents or evidence"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Preview Area */}
      {attachments.length > 0 && (
        <div className="absolute bottom-16 left-0 w-full px-4">
          <div className="flex gap-2 overflow-x-auto p-2 bg-slate-50/90 backdrop-blur border-t border-slate-200 rounded-t-lg">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group flex items-center bg-white border border-slate-200 rounded-md p-2 shadow-sm min-w-[120px]">
                <div className="mr-2 text-cyan-600 bg-cyan-50 p-1 rounded">
                    {getIcon(att.mimeType)}
                </div>
                <span className="text-xs truncate max-w-[100px] text-slate-700">{att.name}</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;