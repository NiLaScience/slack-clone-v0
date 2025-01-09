import { Attachment } from "@/types/dataStructures"
import { FileIcon, FileTextIcon, ImageIcon } from 'lucide-react'

interface FileAttachmentProps {
  attachment: Attachment;
}

export function FileAttachment({ attachment }: FileAttachmentProps) {
  const isImage = attachment.contentType.startsWith('image/');
  const isPdf = attachment.contentType === 'application/pdf';
  const isText = attachment.contentType === 'text/plain';

  if (isImage) {
    return (
      <div className="mt-2">
        <img src={attachment.fileUrl} alt={attachment.filename} className="max-w-full h-auto rounded-md" />
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
      {isPdf ? (
        <FileTextIcon className="h-6 w-6" />
      ) : isText ? (
        <FileTextIcon className="h-6 w-6" />
      ) : (
        <FileIcon className="h-6 w-6" />
      )}
      <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {attachment.filename}
      </a>
    </div>
  );
}

