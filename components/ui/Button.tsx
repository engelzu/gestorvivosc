import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md";
  
  const variants = {
    primary: "bg-gradient-to-r from-lilac-500 to-purple-600 hover:from-lilac-600 hover:to-purple-700 text-white shadow-lilac-200",
    secondary: "bg-white text-lilac-700 border-2 border-lilac-200 hover:bg-lilac-50",
    danger: "bg-gradient-to-r from-red-400 to-rose-500 text-white hover:from-red-500 hover:to-rose-600",
    ghost: "bg-transparent shadow-none text-lilac-700 hover:bg-lilac-100/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="text-current">{icon}</span>}
      {children}
    </button>
  );
};