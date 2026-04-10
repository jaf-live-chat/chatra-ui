import React from "react";
import useCompanyBranding from "../../hooks/useCompanyBranding";

interface LogoProps {
  variant: "light" | "dark" | "collapsed" | "main";
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg" | "xl";
}

const LOGO_SIZES: Record<string, string> = {
  sm: "120px",
  md: "160px",
  lg: "220px",
  xl: "280px",
};

const Logo: React.FC<LogoProps> = ({
  variant,
  alt,
  className,
  style,
  size = "xl",
}: LogoProps) => {
  const { companyName, logos } = useCompanyBranding();
  const logoSource = variant === "main" ? logos.collapsed : logos[variant];
  const width = LOGO_SIZES[size];

  return (
    <img
      src={logoSource}
      alt={alt || `${companyName} Logo`}
      className={className}
      style={{ width, height: "auto", objectFit: "contain", ...style }}
    />
  );
};

export default Logo;
