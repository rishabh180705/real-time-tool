import { useEffect } from 'react';
import { PencilBrush, Shadow } from 'fabric'; // Fabric v6 modular imports

export const useFreeDrawTool = (canvas, selectedTool, options) => {
  useEffect(() => {
    if (!canvas || selectedTool !== 'Pencil') return;

    canvas.isDrawingMode = true;

    // ✅ Set the drawing brush explicitly if it's not already set
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
    }

    const brush = canvas.freeDrawingBrush;

    // ✅ Configure brush
    brush.color = options.stroke || 'black';
    brush.width = options.strokeWidth || 2;

    if (options.shadow) {
      brush.shadow = options.shadow;
    } else if (options.shadowColor) {
      brush.shadow = new Shadow({
        color: options.shadowColor,
        blur: options.shadowBlur || 10,
        offsetX: options.shadowOffsetX || 5,
        offsetY: options.shadowOffsetY || 5,
      });
    } else {
      brush.shadow = null;
    }

    return () => {
      canvas.isDrawingMode = false;
    };
  }, [canvas, selectedTool, options]);
};
