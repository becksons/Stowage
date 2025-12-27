import { useState, useEffect } from 'react';
import { Box } from 'lucide-react';

interface ColorizedIconProps {
  src: string;
  alt: string;
  color?: string;
  className?: string;
  fallbackIcon?: boolean;
}

/**
 * Component that renders an SVG icon with custom color applied.
 * Fetches the SVG, modifies its fill colors, and displays it.
 */
export default function ColorizedIcon({
  src,
  alt,
  color = '#6366f1',
  className = 'w-full h-full object-contain',
  fallbackIcon = false,
}: ColorizedIconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAndColorize = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error('Failed to fetch SVG');
        
        let text = await response.text();

        // Replace common color values with the new color
        // This handles fill, stroke, and stop-color attributes
        text = text.replace(/fill="([^"]+)"/g, (match, fillColor) => {
          // Don't replace transparent or special values
          if (fillColor === 'none' || fillColor === 'transparent') return match;
          // Replace with custom color
          return `fill="${color}"`;
        });

        text = text.replace(/stroke="([^"]+)"/g, (match, strokeColor) => {
          if (strokeColor === 'none' || strokeColor === 'transparent') return match;
          return `stroke="${color}"`;
        });

        // Handle inline styles
        text = text.replace(/style="([^"]*)"/g, (match, styleStr) => {
          let newStyle = styleStr;
          newStyle = newStyle.replace(/fill:\s*[^;]+/g, `fill: ${color}`);
          newStyle = newStyle.replace(/stroke:\s*[^;]+/g, `stroke: ${color}`);
          return `style="${newStyle}"`;
        });

        // Handle stop-color in gradients
        text = text.replace(/stop-color="([^"]+)"/g, (match, stopColor) => {
          if (stopColor === 'none' || stopColor === 'transparent') return match;
          return `stop-color="${color}"`;
        });

        // Create a Blob and object URL for the modified SVG
        const blob = new Blob([text], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        setSvgContent(url);
        setError(false);
      } catch (err) {
        console.error(`Failed to colorize icon ${src}:`, err);
        setError(true);
      }
    };

    fetchAndColorize();

    // Cleanup URL on unmount or when dependencies change
    return () => {
      if (svgContent) {
        URL.revokeObjectURL(svgContent);
      }
    };
  }, [src, color]);

  if (error && fallbackIcon) {
    return <Box className={className} style={{ color }} />;
  }

  // Use the colorized SVG URL if available
  if (svgContent) {
    return (
      <img
        src={svgContent}
        alt={alt}
        className={className}
        onError={() => setError(true)}
      />
    );
  }

  // Fallback to original image while loading
  return (
    <img
      src={src}
      alt={alt}
      className={className}
    />
  );
}
