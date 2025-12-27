import { useMemo } from 'react';
import { Box } from 'lucide-react';

interface ColorizedIconProps {
  src: string;
  alt: string;
  color?: string;
  className?: string;
  fallbackIcon?: boolean;
}

/**
 * Applies color to icons using CSS filters.
 * Works with SVGs containing raster images, gradients, and vector paths.
 */
export default function ColorizedIcon({
  src,
  alt,
  color = '#6366f1',
  className = 'w-full h-full object-contain',
  fallbackIcon = false,
}: ColorizedIconProps) {
  // Generate CSS filter to approximate the target color
  const colorFilter = useMemo(() => {
    // Don't apply filter for default color (indigo)
    if (!color || color === '#6366f1') {
      return undefined;
    }

    // Normalize hex color
    const hex = color.startsWith('#') ? color.slice(1) : color;
    if (hex.length !== 6) return undefined;

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate hue rotation based on RGB
    // This provides a good visual approximation for color changes
    const hue = Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * (180 / Math.PI);
    
    // Calculate saturation boost based on color intensity
    const max = Math.max(r, g, b);
    const saturation = max < 128 ? 1.2 : max > 200 ? 0.9 : 1.0;
    
    // Brightness adjustment
    const brightness = max > 200 ? 0.95 : max < 50 ? 1.1 : 1.0;

    // Combine filters for best color approximation
    return {
      filter: `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`,
    };
  }, [color]);

  if (fallbackIcon && !src) {
    return <Box className={className} style={{ color }} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={colorFilter}
    />
  );
}
