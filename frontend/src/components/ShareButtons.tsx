/** ShareButtons — reusable social share component */
import { useState } from "react";

interface ShareButtonsProps {
  /** The full URL to share */
  url: string;
  /** Share title / text */
  title: string;
  /** Which buttons to show (default: all) */
  platforms?: ("copy" | "twitter" | "facebook" | "whatsapp")[];
}

export function ShareButtons({ url, title, platforms }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const buttons = platforms ?? ["copy", "twitter", "facebook", "whatsapp"];

  const shareText = `${title}\n\n${url}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text method
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(title)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodedText}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="share-buttons">
      {buttons.includes("copy") && (
        <button type="button" className="share-button" onClick={handleCopyLink}>
          {copied ? "✓" : "🔗"}
        </button>
      )}
      {buttons.includes("twitter") && (
        <button type="button" className="share-button" onClick={handleShareTwitter}>
          𝕏
        </button>
      )}
      {buttons.includes("facebook") && (
        <button type="button" className="share-button" onClick={handleShareFacebook}>
          f
        </button>
      )}
      {buttons.includes("whatsapp") && (
        <button type="button" className="share-button" onClick={handleShareWhatsApp}>
          💬
        </button>
      )}
    </div>
  );
}
