import React from "react";
import { APP_LOGO } from "../../constants/constants";

interface LogoProps {
  variant: "light" | "dark" | "main";
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const LOGO_SOURCE_BY_VARIANT: Record<LogoProps["variant"], string> = {
  light: APP_LOGO.logoLight,
  dark: APP_LOGO.logoDark,
  main: APP_LOGO.logoMain,
};

const Logo: React.FC<LogoProps> = ({
  variant,
  alt = "JAF Chatra Logo",
  className,
  style,
}: LogoProps) => {
  return (
    <img
      src={LOGO_SOURCE_BY_VARIANT[variant]}
      alt={alt}
      className={className}
      style={{ width: "auto", objectFit: "contain", ...style }}
    />
  );
};

export default Logo;
