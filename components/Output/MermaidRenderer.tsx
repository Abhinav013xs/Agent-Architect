import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'monospace',
});

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chart) return;
      
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        setError(null);
        // Validating minimal graph syntax to avoid crash
        if(!chart.trim()) return;

        const { svg } = await mermaid.render(id, chart);
        setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        setError("Invalid diagram syntax.");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-900 bg-red-900/20 text-red-200 text-xs font-mono rounded">
        Error rendering diagram: {error}
      </div>
    );
  }

  return (
    <div 
      className="my-4 p-4 bg-slate-900 rounded border border-slate-700 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
};
