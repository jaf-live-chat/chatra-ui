import { createRoot } from "react-dom/client";
import LiveChatWidget from "../../components/widgets/LiveChatWidget";
import type {
  LiveChatEmbedBootstrapConfig,
  LiveChatEmbedScriptAttributes,
} from "../../models/LiveChatEmbedModel";
import widgetStyles from "../../styles/widget-tailwind.css?inline";

const WIDGET_HOST_ID = "livechat-widget-root";
const WIDGET_MOUNT_ID = "livechat-widget-mount";
const WIDGET_STYLE_TAG_ID = "live-chat-widget-style-tag";
const WIDGET_BASE_STYLE_ID = "live-chat-widget-base-style";
const WIDGET_API_KEY_STORAGE_KEY = "chat_widget_api_key";

const normalizeText = (value: string | null | undefined) => String(value || "").trim();

const readStoredApiKey = () => {
  try {
    return normalizeText(window.localStorage.getItem(WIDGET_API_KEY_STORAGE_KEY));
  } catch {
    return "";
  }
};

const writeStoredApiKey = (value: string) => {
  if (!value) {
    return;
  }

  try {
    window.localStorage.setItem(WIDGET_API_KEY_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures for strict embed environments.
  }
};

const resolveCurrentScript = () => {
  if (document.currentScript instanceof HTMLScriptElement) {
    return document.currentScript;
  }

  const scriptElements = Array.from(document.getElementsByTagName("script"));

  // Prefer an explicitly configured embed script when available.
  const configuredScript = scriptElements
    .slice()
    .reverse()
    .find((script) => {
      const hasApiKeyAttribute = Boolean(
        script.getAttribute("data-api-key")
        || script.getAttribute("data-jaf-api-key")
        || script.getAttribute("data-key"),
      );

      if (hasApiKeyAttribute) {
        return true;
      }

      const src = normalizeText(script.getAttribute("src"));
      return /widget(\.min)?\.js$/i.test(src) || /live-chat-widget\.js$/i.test(src);
    });

  if (configuredScript) {
    return configuredScript;
  }

  return scriptElements[scriptElements.length - 1] || null;
};

const parseScriptAttributes = (script: HTMLScriptElement | null): LiveChatEmbedScriptAttributes => {
  const scriptApiKey = normalizeText(
    script?.getAttribute("data-api-key")
    || script?.getAttribute("data-jaf-api-key")
    || script?.getAttribute("data-key"),
  );
  const liveChatConfigApiKey = normalizeText((window as Window & { LiveChatConfig?: { apiKey?: string } }).LiveChatConfig?.apiKey);
  const storedApiKey = readStoredApiKey();

  const apiKey = scriptApiKey || liveChatConfigApiKey || storedApiKey;
  writeStoredApiKey(apiKey);

  return {
    apiKey,
  };
};

const resolveBootstrapConfig = (): LiveChatEmbedBootstrapConfig | null => {
  const script = resolveCurrentScript();
  const attributes = parseScriptAttributes(script);

  if (!attributes.apiKey) {
    console.error("LiveChatWidget: apiKey is required");
    return null;
  }

  return {
    apiKey: attributes.apiKey,
  };
};

const ensureWidgetHost = () => {
  const existingHost = document.getElementById(WIDGET_HOST_ID);
  if (existingHost) {
    return existingHost;
  }

  const host = document.createElement("div");
  host.id = WIDGET_HOST_ID;
  document.body.appendChild(host);
  return host;
};

const ensureShadowMount = (host: HTMLElement) => {
  const shadowRoot = host.shadowRoot || host.attachShadow({ mode: "open" });

  const existingBaseStyle = shadowRoot.querySelector(`#${WIDGET_BASE_STYLE_ID}`);
  if (!existingBaseStyle) {
    const baseStyle = document.createElement("style");
    baseStyle.id = WIDGET_BASE_STYLE_ID;
    baseStyle.textContent = [
      ":host {",
      "  all: initial;",
      "  contain: layout style;",
      "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;",
      "  font-size: 16px;",
      "  line-height: 1.5;",
      "  color: #111827;",
      "  -webkit-font-smoothing: antialiased;",
      "  -moz-osx-font-smoothing: grayscale;",
      "}",
      "* {",
      "  box-sizing: border-box;",
      "}",
      `#${WIDGET_MOUNT_ID} {`,
      "  all: revert;",
      "  display: block;",
      "}",
      "button {",
      "  font-family: inherit;",
      "  font-size: inherit;",
      "  cursor: pointer;",
      "}",
      "input, textarea, select {",
      "  font-family: inherit;",
      "  font-size: inherit;",
      "  color: inherit;",
      "}",
    ].join("\n");
    shadowRoot.appendChild(baseStyle);
  }

  const existingStyleTag = shadowRoot.querySelector(`#${WIDGET_STYLE_TAG_ID}`);
  if (!existingStyleTag) {
    const styleTag = document.createElement("style");
    styleTag.id = WIDGET_STYLE_TAG_ID;
    styleTag.textContent = widgetStyles;
    shadowRoot.appendChild(styleTag);
  }

  let mountNode = shadowRoot.querySelector(`#${WIDGET_MOUNT_ID}`) as HTMLDivElement | null;
  if (!mountNode) {
    mountNode = document.createElement("div");
    mountNode.id = WIDGET_MOUNT_ID;
    shadowRoot.appendChild(mountNode);
  }

  return mountNode;
};

const mountWidget = async () => {
  const bootstrapConfig = resolveBootstrapConfig();

  if (!bootstrapConfig) {
    return;
  }

  if (!document.body) {
    document.addEventListener("DOMContentLoaded", () => {
      void mountWidget();
    }, { once: true });
    return;
  }

  const host = ensureWidgetHost();
  const mountNode = ensureShadowMount(host);

  createRoot(mountNode).render(
    <LiveChatWidget initialConfig={{ apiKey: bootstrapConfig.apiKey }} />,
  );
};

void mountWidget();
