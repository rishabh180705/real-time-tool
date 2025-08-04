import { useEffect } from 'react';

export function usePanTool(canvas, isPanMode) {
  useEffect(() => {
    if (!canvas || !isPanMode) return;

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const onMouseDown = (opt) => {
      isDragging = true;
      lastPosX = opt.e.clientX;
      lastPosY = opt.e.clientY;
      canvas.setCursor('grabbing');
      canvas.renderAll();
    };

    const onMouseMove = (opt) => {
      if (!isDragging) return;

      const e = opt.e;
      const deltaX = e.clientX - lastPosX;
      const deltaY = e.clientY - lastPosY;

      canvas.relativePan({ x: deltaX, y: deltaY });

      lastPosX = e.clientX;
      lastPosY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      canvas.setCursor('grab');
      canvas.renderAll();
    };

    canvas.setCursor('grab');
    canvas.defaultCursor = 'grab';
    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.setCursor('default');
      canvas.defaultCursor = 'default';
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, [canvas, isPanMode]);
}
