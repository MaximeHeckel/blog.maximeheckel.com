export interface CardWrapperProps {
  glass?: boolean;
  depth?: 0 | 1 | 2 | 3;
}

export interface CardComposition {
  Header?: React.FC<{
    className?: string;
  }>;
  Body?: React.FC<{
    className?: string;
  }>;
}

export interface CardProps extends CardWrapperProps {
  title?: string;
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}
