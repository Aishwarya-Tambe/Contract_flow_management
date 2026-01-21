import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hover = false,
  style,
}: CardProps) => {
  const hoverStyles = hover
    ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 ${hoverStyles} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={`px-6 py-4 border-b border-slate-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardFooter = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={`px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
};
