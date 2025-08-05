
import { useEffect } from 'react';
import {
  Rect,
  Circle,
  Line,
  Triangle,
  Polygon,
  Textbox
} from 'fabric';

export const useShapeTool = (canvas, tool, options) => {
  useEffect(() => {
    if (!canvas || tool === 'Pointer') return;

    let shape = null;

    const onMouseDown = (opt) => {
      // Don't draw if clicking on an existing object
      if (opt.target) return;

      const { x, y } = canvas.getPointer(opt.e);
      const commonProps = {
        left: x,
        top: y,
        fill: options.fill || 'rgba(0,0,255,0.1)',
        stroke: options.fill || 'black',
        strokeWidth: options.strokeWidth || 2,
        originX: 'left',
        originY: 'top',
      };

      switch (tool) {
        case 'Square':
          shape = new Rect({ ...commonProps, width: 0, height: 0 });
          break;
        case 'Circle':
          shape = new Circle({ ...commonProps, radius: 1 });
          break;
        case 'Line':
          shape = new Line([x, y, x, y], {
            stroke: options.stroke || 'black',
            strokeWidth: options.strokeWidth || 2,
          });
          break;
        case 'Triangle':
          shape = new Triangle({ ...commonProps, width: 0, height: 0 });
          break;
        case 'Diamond':
          shape = new Polygon(
            [
              { x: 0, y: 50 },
              { x: 50, y: 0 },
              { x: 100, y: 50 },
              { x: 50, y: 100 },
            ],
            {
              ...commonProps,
              left: x,
              top: y,
              objectCaching: false,
              scaleX: 1,
              scaleY: 1,
            }
          );
          break;
        case 'Text':
          shape = new Textbox('Type here ', {
            left: x,
            top: y,
            fontSize: 32,
            fill: options.stroke || 'black',
          });
          break;
        default:
          return;
      }

      if (shape) {
        canvas.add(shape);
      }
    };

    const onMouseMove = (opt) => {
      if (!shape || tool === 'Text' || tool === 'Diamond') return;

      const pointer = canvas.getPointer(opt.e);
      const width = pointer.x - shape.left;
      const height = pointer.y - shape.top;

      switch (tool) {
        case 'Square':
        case 'Triangle':
          shape.set({ width, height });
          break;
        case 'Circle':
          const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
          shape.set({ radius });
          break;
        case 'Line':
          shape.set({ x2: pointer.x, y2: pointer.y });
          break;
      }

      canvas.renderAll();
    };

    const onMouseUp = () => {
      shape = null;
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, [canvas, tool, options]);
};
