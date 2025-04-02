import { ReactNode } from "react";

type TypographyH4Props = {
  children: ReactNode;
  className: string;
};

export function TypographyH4({ children, className }: TypographyH4Props) {
  return (
    <h4
      className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}
    >
      {children}
    </h4>
  );
}
