import { Leva, useControls } from 'leva';
import { useEffect } from 'react';

export interface SceneControls {
  frequency: number;
  pixelSize: number;
}

interface SceneDebugControlsProps {
  onChange: (controls: SceneControls) => void;
}

const SceneDebugControls = ({ onChange }: SceneDebugControlsProps) => {
  const { frequency, pixelSize } = useControls({
    frequency: { value: 0.3, min: 0, max: 1, step: 0.01 },
    pixelSize: { value: 4.0, min: 2.0, max: 64.0, step: 2.0 },
  });

  useEffect(() => {
    onChange({ frequency, pixelSize });
  }, [frequency, pixelSize, onChange]);

  return <Leva />;
};

export default SceneDebugControls;
