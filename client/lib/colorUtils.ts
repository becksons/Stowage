/**
 * Converts a hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Gets the CSS filter string to colorize an SVG icon
 * Uses a combination of hue-rotate, saturate, and brightness adjustments
 */
export function getIconColorFilter(hexColor: string): string {
  const defaultColor = '#6366f1'; // Indigo
  
  if (!hexColor || hexColor === defaultColor) {
    return '';
  }

  // Calculate hue rotation needed to transform default color to target color
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '';

  // Calculate relative brightness
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  
  // Apply different filters based on color brightness
  if (brightness > 200) {
    // Light colors: reduce brightness
    return `brightness(0.9) saturate(1.1) hue-rotate(15deg)`;
  } else if (brightness < 50) {
    // Dark colors: increase brightness
    return `brightness(1.2) saturate(0.9) hue-rotate(-15deg)`;
  }
  
  // Mid-range colors: balanced approach
  return `saturate(1.15) brightness(0.95) hue-rotate(0deg)`;
}

/**
 * Gets rgba color with opacity for background
 */
export function getColorWithOpacity(hexColor: string, opacity: number = 0.15): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return `rgba(99, 102, 241, ${opacity})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Gets rgba color for border
 */
export function getColorBorder(hexColor: string, opacity: number = 0.3): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return `rgba(99, 102, 241, ${opacity})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Determines if a color is "dark" or "light" for contrast purposes
 */
export function isDarkColor(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return false;
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 128;
}
