import { useEffect } from 'react';
import { Triangle ,Line} from 'fabric';

export const useArrowTool = (canvas, activeTool,options) => {
  useEffect(() => {
    if (!canvas || activeTool !== 'Arrow') return;

    let line, arrowHead;

    const onMouseDown = (opt) => {
        if (opt.target) return;
      const { x, y } = canvas.getPointer(opt.e);

      line = new Line([x, y, x, y], {
        stroke: options.stroke || '#000',
        strokeWidth: options.strokeWidth || 2,
        selectable: true,
           evented: true,
      });

      arrowHead = new Triangle({
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
        pointType: 'arrow',
        angle: 0,
        width: 20,
        height: 30,
        fill: options.fill || '#000',
      });

      canvas.add(line, arrowHead);
    };

    const onMouseMove = (opt) => {
      if (!line || !arrowHead) return;
      const { x, y } = canvas.getPointer(opt.e);

      line.set({ x2: x, y2: y });

      // Compute angle and position of arrowhead
      const dx = x - line.x1;
      const dy = y - line.y1;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      arrowHead.set({
        left: x,
        top: y,
        angle: angle + 90, // triangle pointing direction
      });

      canvas.renderAll();
    };

    const onMouseUp = () => {
      if (line) line.set({ selectable: true, evented: true });
      if (arrowHead) arrowHead.set({ selectable: true, evented: true });

      line = null;
      arrowHead = null;
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, [canvas, activeTool]);
};
