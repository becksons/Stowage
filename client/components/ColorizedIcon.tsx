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
 * Intelligently colorizes SVG icons while preserving structure.
 * Uses a combination of SVG replacement and CSS filters for best results.
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndColorize = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error('Failed to fetch SVG');
        
        let text = await response.text();

        // More careful color replacement that preserves SVG structure
        // Only replace actual color values in specific contexts
        
        // Replace fill colors (but not structural attributes)
        text = text.replace(/fill=["']([^"']+)["']/g, (match, fillValue) => {
          // Preserve these special values
          if (fillValue === 'none' || fillValue === 'transparent' || fillValue === 'currentColor') {
            return match;
          }
          // Only replace hex colors, rgb, named colors - not variables or references
          if (fillValue.startsWith('url(') || fillValue.startsWith('var(')) {
            return match;
          }
          return `fill="${color}"`;
        });

        // Replace stroke colors similarly
        text = text.replace(/stroke=["']([^"']+)["']/g, (match, strokeValue) => {
          if (strokeValue === 'none' || strokeValue === 'transparent' || strokeValue === 'currentColor') {
            return match;
          }
          if (strokeValue.startsWith('url(') || strokeValue.startsWith('var(')) {
            return match;
          }
          return `stroke="${color}"`;
        });

        // Handle inline style attributes more carefully
        text = text.replace(/style=["']([^"']+)["']/g, (match, styleValue) => {
          if (!styleValue.includes('fill') && !styleValue.includes('stroke')) {
            return match;
          }
          
          let newStyle = styleValue;
          // Replace fill in styles, but be careful about URLs
          newStyle = newStyle.replace(/fill:\s*(?!url)(?!var)([^;]+)/g, `fill: ${color}`);
          // Replace stroke in styles
          newStyle = newStyle.replace(/stroke:\s*(?!url)(?!var)([^;]+)/g, `stroke: ${color}`);
          
          return `style="${newStyle}"`;
        });

        // Handle stop-color in gradients
        text = text.replace(/stop-color=["']([^"']+)["']/g, (match, stopValue) => {
          if (stopValue === 'none' || stopValue === 'transparent') {
            return match;
          }
          if (stopValue.startsWith('url(') || stopValue.startsWith('var(')) {
            return match;
          }
          return `stop-color="${color}"`;
        });

        // Create data URL with proper encoding
        const encodedSvg = encodeURIComponent(text);
        const dataUrl = `data:image/svg+xml,${encodedSvg}`;
        setSvgContent(dataUrl);
        setError(false);
      } catch (err) {
        console.error(`Failed to colorize icon ${src}:`, err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndColorize();
  }, [src, color]);

  // Show fallback icon if there's an error and fallback is enabled
  if (error && fallbackIcon) {
    return <Box className={className} style={{ color }} />;
  }

  // If error but no fallback, show original image
  if (error) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
      />
    );
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
