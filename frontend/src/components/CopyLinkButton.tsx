import { ClipboardCopy } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function CopyLinkButton({ url }: { url: string }) {
  const { addToast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      addToast({ message: 'Link copied to clipboard', type: 'success' });
    } catch (e) {
      addToast({ message: 'Failed to copy link', type: 'error' });
    }
  };

  return (
    <button
      onClick={copy}
      className="p-2 rounded hover:bg-muted transition-colors"
      aria-label="Copy scan link"
    >
      <ClipboardCopy className="w-5 h-5 text-foreground" />
    </button>
  );
}
