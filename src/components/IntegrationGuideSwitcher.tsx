import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { Check, Copy } from "lucide-react";
import { APP_URL } from "../constants/constants";

type IntegrationGuideSwitcherProps = {
  apiKey?: string;
  companyName?: string;
};

const INTEGRATION_SNIPPETS = {
  HTML: {
    label: "HTML",
    description: "Basic integration for any HTML page.",
    code: `<!-- JAF Chatra Widget -->
<script
  src="https://chatra.jafdigital.co//widget.js"
  data-api-key="YOUR_API_KEY_HERE">
</script>`,
    language: "html",
  },
  React: {
    label: "React",
    description: "Client-side React integration using useEffect.",
    code: `import { useEffect } from "react";

const ChatWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://chatra.jafdigital.co//widget.js";
    script.setAttribute("data-api-key", "YOUR_API_KEY_HERE");
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatWidget;`,
    language: "tsx",
  },
  Vue: {
    label: "Vue",
    description: "Vue 3 integration with mounted lifecycle hooks.",
    code: `<script setup>
import { onMounted, onUnmounted } from "vue";

let script;

onMounted(() => {
  script = document.createElement("script");
  script.src = "https://chatra.jafdigital.co//widget.js";
  script.setAttribute("data-api-key", "YOUR_API_KEY_HERE");
  script.async = true;

  document.body.appendChild(script);
});

onUnmounted(() => {
  if (script) document.body.removeChild(script);
});
</script>

<template>
  <div></div>
</template>`,
    language: "vue",
  },
  Angular: {
    label: "Angular",
    description: "Angular integration with lifecycle cleanup.",
    code: `import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-chat-widget',
  template: ''
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  script!: HTMLScriptElement;

  ngOnInit(): void {
    this.script = document.createElement('script');
    this.script.src = 'https://chatra.jafdigital.co//widget.js';
    this.script.setAttribute('data-api-key', 'YOUR_API_KEY_HERE');
    this.script.async = true;

    document.body.appendChild(this.script);
  }

  ngOnDestroy(): void {
    if (this.script) {
      document.body.removeChild(this.script);
    }
  }
}`,
    language: "typescript",
  },
  "Next.js": {
    label: "Next.js",
    description: "Client-side only Next.js component integration.",
    code: `import { useEffect } from "react";

export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://chatra.jafdigital.co//widget.js";
    script.setAttribute("data-api-key", "YOUR_API_KEY_HERE");
    script.async = true;

    document.body.appendChild(script);
  }, []);

  return null;
}`,
    language: "tsx",
  },
  JavaScript: {
    label: "JavaScript",
    description: "Plain JavaScript dynamic load snippet.",
    code: `(function () {
  var script = document.createElement("script");
  script.src = "https://chatra.jafdigital.co//widget.js";
  script.setAttribute("data-api-key", "YOUR_API_KEY_HERE");
  script.async = true;

  document.body.appendChild(script);
})();`,
    language: "javascript",
  },
  PHP: {
    label: "PHP",
    description: "PHP or Blade embed with the API key injected from the portal.",
    code: `<!-- JAF Chatra Widget -->
<script
  src="https://chatra.jafdigital.co//widget.js"
  data-api-key="YOUR_API_KEY_HERE">
</script>`,
    language: "php",
  },
} as const;

type IntegrationTabKey = keyof typeof INTEGRATION_SNIPPETS;

const tabKeys = Object.keys(INTEGRATION_SNIPPETS) as IntegrationTabKey[];
const WIDGET_SCRIPT_URL = `${APP_URL}/widget.js`;

const IntegrationGuideSwitcher = ({ apiKey, companyName }: IntegrationGuideSwitcherProps) => {
  const [activeTab, setActiveTab] = useState<IntegrationTabKey>("HTML");
  const [copied, setCopied] = useState(false);

  const viteMode = (
    import.meta as ImportMeta & { env?: Record<string, string | undefined> }
  ).env?.VITE_MODE;

  const resolvedWidgetScriptUrl =
    viteMode?.toUpperCase() === "LOCAL"
      ? "./client/dist/widget.js"
      : WIDGET_SCRIPT_URL;
  const resolvedApiKey = apiKey?.trim() || "YOUR_API_KEY_HERE";
  const resolvedCompanyName = companyName?.trim() || "JAF Chatra";

  const activeSnippet = useMemo(() => {
    const snippet = INTEGRATION_SNIPPETS[activeTab];

    return {
      ...snippet,
      code: snippet.code
        .replaceAll("https://chatra.jafdigital.co//widget.js", WIDGET_SCRIPT_URL)
        .replaceAll(WIDGET_SCRIPT_URL, resolvedWidgetScriptUrl)
        .replaceAll("YOUR_API_KEY_HERE", resolvedApiKey)
        .replaceAll("{{YOUR_API_KEY_HERE}}", resolvedApiKey)
        .replaceAll("JAF Chatra", resolvedCompanyName),
    };
  }, [activeTab, resolvedApiKey, resolvedCompanyName, resolvedWidgetScriptUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
  };

  const handleCloseSnackbar = () => {
    setCopied(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={1.25} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0A192F" }}>
          Integration Guide
        </Typography>
        <Typography sx={{ color: "#475569", maxWidth: 760, lineHeight: 1.65 }}>
          Choose your framework and copy the integration snippet for the JAF Chatra widget. The portal version uses the company API key from the database, while the public version keeps the placeholder.
        </Typography>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, nextTab: IntegrationTabKey) => setActiveTab(nextTab)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 2,
            pt: 1.25,
            borderBottom: "1px solid #E2E8F0",
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: 999,
              bgcolor: "#0891B2",
            },
            "& .MuiTab-root": {
              minHeight: 52,
              textTransform: "none",
              fontWeight: 700,
              color: "#64748B",
            },
            "& .Mui-selected": {
              color: "#0891B2",
            },
          }}
        >
          {tabKeys.map((key) => (
            <Tab key={key} value={key} label={INTEGRATION_SNIPPETS[key].label} />
          ))}
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#0F172A" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography sx={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.95rem" }}>
                {activeSnippet.label}
              </Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mt: 0.25 }}>
                {activeSnippet.description}
              </Typography>
            </Box>

            <Tooltip title="Copy code" arrow>
              <IconButton
                onClick={handleCopy}
                aria-label="Copy integration code"
                sx={{
                  color: "#E2E8F0",
                  border: "1px solid #334155",
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  "&:hover": { bgcolor: "#1E293B" },
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <Typography sx={{ ml: 1, fontSize: "0.85rem", fontWeight: 700 }}>
                  {copied ? "Copied!" : "Copy"}
                </Typography>
              </IconButton>
            </Tooltip>
          </Stack>

          <Box
            sx={{
              border: "1px solid #1E293B",
              borderRadius: 3,
              bgcolor: "#020617",
              overflow: "hidden",
              transition: "all 220ms ease",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: "1px solid #1E293B",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem", fontFamily: "monospace" }}>
                widget.{activeSnippet.language}
              </Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem" }}>
                Paste before the closing body tag or load it dynamically.
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 2.5 }, overflowX: "auto" }}>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  color: "#E2E8F0",
                  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  transition: "opacity 180ms ease",
                }}
              >
                {activeSnippet.code}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={1800}
        onClose={handleCloseSnackbar}
        message="Copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default IntegrationGuideSwitcher;
