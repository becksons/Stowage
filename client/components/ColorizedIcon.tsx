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
 * Converts RGB to HSL to get hue value
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Calculates the hue rotation needed to transform from source color to target color
 * Default icon color: #7E1DED (purple)
 */
function calculateHueRotation(targetHex: string): number {
  // Parse target color
  const hex = targetHex.startsWith('#') ? targetHex.slice(1) : targetHex;
  if (hex.length !== 6) return 0;

  const targetR = parseInt(hex.substring(0, 2), 16);
  const targetG = parseInt(hex.substring(2, 4), 16);
  const targetB = parseInt(hex.substring(4, 6), 16);

  // Get hue of target color
  const targetHsl = rgbToHsl(targetR, targetG, targetB);

  // Default icon color: #7E1DED = rgb(126, 29, 237)
  const sourceHsl = rgbToHsl(126, 29, 237);

  // Calculate hue rotation needed
  let rotation = targetHsl.h - sourceHsl.h;

  // Normalize rotation to -180 to 180 range
  if (rotation > 180) {
    rotation -= 360;
  } else if (rotation < -180) {
    rotation += 360;
  }

  return rotation;
}

/**
 * Applies color to icons using CSS filters.
 * Converts the default purple (#7E1DED) to any target color.
 */
export default function ColorizedIcon({
  src,
  alt,
  color = '#6366f1',
  className = 'w-full h-full object-contain',
  fallbackIcon = false,
}: ColorizedIconProps) {
  // Calculate CSS filter to transform the icon color
  const colorFilter = useMemo(() => {
    // Don't apply filter for common defaults
    if (!color || color.toLowerCase() === '#7e1ded') {
      return undefined;
    }

    const hueRotation = calculateHueRotation(color);

    // Return filter with hue rotation
    // Saturation and brightness are boosted to maintain vibrancy
    return {
      filter: `hue-rotate(${hueRotation}deg) saturate(1.1) brightness(1.0)`,
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
