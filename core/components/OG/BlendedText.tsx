interface BlendedTextProps {
  children: React.ReactNode;
}

const BlendedText = (props: BlendedTextProps) => {
  const { children } = props;
  return (
    <div style={{ position: 'relative' }}>
      {/* <div
        style={{
          color: 'white',
          position: 'absolute',
          opacity: 0.015,
        }}
      >
        {children}
      </div> */}
      <div
        style={{
          color: 'white',
          mixBlendMode: 'overlay',
          position: 'absolute',
        }}
      >
        {children}
      </div>
      <div
        style={{
          color: 'white',
          mixBlendMode: 'overlay',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BlendedText;
