import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, Home, LifeBuoy, Search } from "lucide-react";

const quickLinks = [
  {
    title: "Back to home",
    description: "Return to the product overview and latest updates.",
    to: "/",
    icon: Home,
  },
  {
    title: "Explore features",
    description: "See all tools available for support teams.",
    to: "/features",
    icon: Search,
  },
  {
    title: "Visit help center",
    description: "Read guides and setup resources.",
    to: "/resources/help-center",
    icon: LifeBuoy,
  },
];

const NotFound = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-slate-100"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

      <main className="relative min-h-screen flex items-center px-6 py-12 md:py-16">
        <div className="w-full max-w-6xl mx-auto rounded-3xl border border-cyan-100/80 bg-white/80 backdrop-blur-sm shadow-2xl shadow-cyan-900/10">
          <div className="grid lg:grid-cols-5 gap-6 p-6 md:p-10 lg:p-12">
            <section className="lg:col-span-3 flex flex-col justify-center">
              <span className="inline-flex w-fit items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-800">
                Error 404
              </span>

              <h1 className="mt-5 text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                This page took a wrong turn.
              </h1>
              <p className="mt-4 max-w-2xl text-slate-600 text-base md:text-lg leading-relaxed">
                The link might be outdated, the URL may have changed, or the page was moved. You can head back home or jump to a popular section.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-700/20 transition-colors hover:bg-cyan-800"
                >
                  Go to homepage
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Sign in
                </Link>
              </div>
            </section>

            <section className="lg:col-span-2 grid gap-4 content-center">
              {quickLinks.map(({ title, description, to, icon: Icon }) => (
                <Link
                  key={title}
                  to={to}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-50 group-hover:text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </Link>
              ))}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;