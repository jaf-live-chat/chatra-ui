import { createRoot } from "react-dom/client";
import LiveChatWidget from "../../components/widgets/LiveChatWidget";
import type {
  LiveChatEmbedBootstrapConfig,
  LiveChatEmbedScriptAttributes,
} from "../../models/LiveChatEmbedModel";
import appStyles from "../../styles/index.css?inline";

const WIDGET_HOST_ID = "livechat-widget-root";
const WIDGET_MOUNT_ID = "livechat-widget-mount";
const WIDGET_STYLE_TAG_ID = "live-chat-widget-style-tag";
const WIDGET_BASE_STYLE_ID = "live-chat-widget-base-style";

const normalizeText = (value: string | null | undefined) => String(value || "").trim();

const resolveCurrentScript = () => {
  if (document.currentScript instanceof HTMLScriptElement) {
    return document.currentScript;
  }

  const scriptElements = Array.from(document.getElementsByTagName("script"));
  return scriptElements[scriptElements.length - 1] || null;
};

const parseScriptAttributes = (script: HTMLScriptElement | null): LiveChatEmbedScriptAttributes => {
  const apiKey = normalizeText(script?.getAttribute("data-api-key"));

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
      "  font-size: 16px;",
      "  color: initial;",
      "}",
      `#${WIDGET_MOUNT_ID} {`,
      "  all: initial;",
      "  display: block;",
      "}",
    ].join("\n");
    shadowRoot.appendChild(baseStyle);
  }

  const existingStyleTag = shadowRoot.querySelector(`#${WIDGET_STYLE_TAG_ID}`);
  if (!existingStyleTag) {
    const styleTag = document.createElement("style");
    styleTag.id = WIDGET_STYLE_TAG_ID;
    styleTag.textContent = appStyles;
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
