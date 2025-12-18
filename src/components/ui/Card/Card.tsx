import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-lg transition-all';

    const variantStyles = {
      default: 'bg-white border border-gray-200',
      outlined: 'bg-transparent border-2 border-gray-300',
      elevated: 'bg-white shadow-md hover:shadow-lg',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const hoverStyles = hoverable
      ? 'cursor-pointer hover:shadow-lg hover:border-primary-300'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export const CardHeader = ({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`mb-4 ${className}`} {...props} />
);

export const CardTitle = ({
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />
);

export const CardDescription = ({
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-600 ${className}`} {...props} />
);

export const CardContent = ({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} {...props} />
);

export const CardFooter = ({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-4 flex items-center gap-2 ${className}`} {...props} />
);

export default Card;
