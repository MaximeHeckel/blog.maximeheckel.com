import Logo from '@core/components/Logo';
import { useRouter } from 'next/router';
import BlendedText from './BlendedText';
import DotMatrix from './DotMatrix';
import Shapes from './Shapes';

const OG = () => {
  const router = useRouter();
  const { title, background } = router.query as {
    title: string;
    background: string;
  };

  return (
    <div
      style={{
        overflow: 'hidden',
        fontFamily: 'Inter',
        fontWeight: 600,
        lineHeight: '1.2',
        width: '1200px',
        height: '630px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'scale(1.5)',
        transformOrigin: 'top left',
        // background:
        //   'linear-gradient(250deg, #7B9FF7 20%, #E995CD 56.25%, #FCB2B2 100%)',
        // background:
        //   'linear-gradient(212deg, #37388F 19.79%, #6C60B8 70.31%, #A780B2 100%)',
        // background:
        //   'linear-gradient(212deg, #37398F 19.79%, #6075B8 70.31%, #B3DFED 100%)',
        background:
          background || 'linear-gradient(214deg, #A0A0A0 0%, #1F2426 96.12%)',
        position: 'relative',
        gap: '120px',
      }}
    >
      <div
        style={{
          position: 'absolute',
        }}
      >
        <Shapes />
      </div>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
      >
        <DotMatrix />
      </div>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.00) 85.94%)',
        }}
      />
      <div style={{ maxWidth: '830px', fontSize: 56 }}>
        <BlendedText>{title}</BlendedText>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '950px',
          fontSize: 20,
          zIndex: 0,
        }}
      >
        <Logo size={65} stroke="#FFFFFF" />
        <BlendedText>@MaximeHeckel</BlendedText>
      </div>
    </div>
  );
};

export default OG;
