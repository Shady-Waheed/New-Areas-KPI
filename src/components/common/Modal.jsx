import { useEffect } from "react";
import { X } from "lucide-react";
import isArabic from "../../utils/isArabic";

/**
 * @param {{ isOpen: boolean, onClose: () => void, title: string, children: import('react').ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl' }} props
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasArabic = isArabic(title);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizes[size]} max-h-[92vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2
            id="modal-title"
            dir={hasArabic ? "rtl" : "auto"}
            className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${hasArabic ? "text-right" : ""}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div
          dir={hasArabic ? "rtl" : "ltr"}
          className={`overflow-y-auto max-h-[calc(92vh-4rem)] p-4 sm:max-h-[calc(90vh-4rem)] sm:p-6 ${hasArabic ? "text-right" : ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
