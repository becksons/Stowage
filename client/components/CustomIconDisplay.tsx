import React from "react";
import { getItemIconPath, getStorageIconPath } from "@/lib/customIcons";

interface CustomIconDisplayProps {
  type: "item" | "storage";
  name?: string;
  storageType?: string;
  className?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

/**
 * Custom Icon Display Component
 * Renders custom SVG icons for items and storage spaces
 * Falls back to a placeholder if icon not found
 */
export const CustomIconDisplay: React.FC<CustomIconDisplayProps> = ({
  type,
  name,
  storageType,
  className = "w-12 h-12",
  alt,
  fallback = "📦",
}) => {
  const iconPath =
    type === "item"
      ? getItemIconPath(name)
      : getStorageIconPath(storageType);

  const altText =
    alt || (type === "item" ? name || "Item" : storageType || "Storage");

  return (
    <div className={`inline-flex items-center justify-center rounded-lg bg-primary/15 border border-primary/30 ${className}`}>
      <img
        src={iconPath}
        alt={altText}
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
};

export default CustomIconDisplay;
