import type { ReactNode } from "react";
import { Link } from "react-router";
import { APP_LOGO } from "../../constants/constants";

type AuthFormCardFooterVariant = "inline" | "panel";

interface AuthFormCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  footerVariant?: AuthFormCardFooterVariant;
}

interface AuthPageLayoutProps {
  children: ReactNode;
}

export const AuthFormCard = ({
  title,
  description,
  icon,
  children,
  footer,
  footerVariant = "inline",
}: AuthFormCardProps) => {
  return (
    <div className="w-full max-w-[620px] rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-300/50">
      <div className="px-8 py-10 md:px-12 md:py-12">
        <div className="mb-7 text-center">
          {icon ? <div className="mb-4 inline-flex">{icon}</div> : null}
          <h1 className="mb-2 text-[30px] font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-slate-500">{description}</p>
        </div>

        {children}

        {footer && footerVariant === "inline" ? (
          <div className="pt-4 text-center text-sm text-slate-500">{footer}</div>
        ) : null}
      </div>

      {footer && footerVariant === "panel" ? (
        <div className="border-t border-slate-100 bg-slate-50 px-8 py-5 text-center text-sm text-slate-500">{footer}</div>
      ) : null}
    </div>
  );
};

const AuthPageLayout = ({ children }: AuthPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-100" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="px-6 pt-6 md:px-10 md:pt-8">
        <Link to="/" className="inline-flex">
          <img src={APP_LOGO.logoDark} alt="JAF Chatra" className="h-10 w-auto md:h-12" />
        </Link>
      </div>

      <main className="mx-auto flex min-h-[calc(100vh-110px)] w-full max-w-6xl items-center justify-center px-6 pb-12 pt-6">
        {children}
      </main>
    </div>
  );
};

export default AuthPageLayout;