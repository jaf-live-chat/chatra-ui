import { Copy, Check } from "lucide-react";
import { useState } from "react";

const codeSnippet = `<!-- Live Chat Widget -->
<script>
  window.LiveChatConfig = {
    apiUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev/api/v1',
    socketUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev'
  };
</script>

<script src="https://timora-live-chat.vercel.app/widget/live-chat-widget.js"></script>`;

const IntegrationSection = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = codeSnippet;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeSnippet.split("\n");

  return (
    <section className="bg-white py-12 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div>
            <span
              className="inline-block bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full mb-4"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 600 }}
            >
              Integration
            </span>
            <h2
              className="text-gray-900 mb-5"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                lineHeight: "1.2",
                letterSpacing: "-0.02em",
              }}
            >
              Easy Website Integration
            </h2>
            <p
              className="mb-6 text-gray-500"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", lineHeight: "1.7" }}
            >
              Add JAF Live Chat to your website using a simple JavaScript snippet. It works with any platform — WordPress, Shopify, Wix, or custom HTML sites.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Paste one script tag into your website's HTML",
                "Works on any website or CMS platform",
                "Loads asynchronously — no impact on page speed",
                "Fully customizable widget appearance",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-cyan-600" />
                  </div>
                  <span
                    className="text-gray-600"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.84rem" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              {["WordPress", "Shopify", "Wix", "Squarespace", "HTML"].map((platform) => (
                <span
                  key={platform}
                  className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 500 }}
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Code Block */}
          <div className="w-full">
            <div className="max-w-full overflow-hidden rounded-2xl border border-gray-800 shadow-2xl">
              {/* Code Header */}
              <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="max-w-[120px] truncate text-gray-400 sm:max-w-none" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem" }}>
                    index.html
                  </span>
                </div>
                <div
                  onClick={handleCopy}
                  className="cursor-pointer items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-200 hidden sm:flex"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem" }}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className={copied ? "text-green-400" : ""}>{copied ? "Copied!" : "Copy"}</span>
                </div>
                <button
                  onClick={handleCopy}
                  type="button"
                  className="inline-flex items-center gap-1 text-gray-300 sm:hidden"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem" }}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className={copied ? "text-green-400" : ""}>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Code Body */}
              <div className="overflow-x-auto bg-gray-950 p-3.5 sm:p-5">
                <pre
                  className="whitespace-pre-wrap break-words sm:whitespace-pre"
                  style={{ fontFamily: "monospace", fontSize: "0.7rem", lineHeight: "1.7" }}
                >
                  {lines.map((line, i) => (
                    <div key={i} className="flex items-start">
                      <span className="mr-2 w-6 shrink-0 select-none text-right text-gray-600 sm:mr-4 sm:w-7" style={{ fontSize: "0.62rem" }}>
                        {i + 1}
                      </span>
                      <span className="break-words">
                        {line.includes("<!--") || line.includes("-->") ? (
                          <span className="text-gray-500">{line}</span>
                        ) : line.includes("<script") || line.includes("</script") ? (
                          <span>
                            {line.split(/(<script[^>]*>|<\/script>)/).map((part, j) =>
                              part.startsWith("<") ? (
                                <span key={j} className="text-blue-400">{part}</span>
                              ) : (
                                <span key={j} className="text-gray-300">{part}</span>
                              )
                            )}
                          </span>
                        ) : line.includes("window.") || line.includes("apiUrl") || line.includes("socketUrl") ? (
                          <span className="text-purple-400">{line}</span>
                        ) : line.includes("'https://") || line.includes("\"https://") ? (
                          <span className="text-green-400">{line}</span>
                        ) : line.includes("//") ? (
                          <span className="text-gray-500">{line}</span>
                        ) : (
                          <span className="text-gray-300">{line}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>

              {/* Code Footer */}
              <div className="flex items-center gap-2 border-t border-gray-800 bg-gray-900 px-4 py-3 sm:px-5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem" }}>
                  Paste this snippet before the <span className="text-blue-400 font-mono">{"</body>"}</span> tag on your website.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntegrationSection;


