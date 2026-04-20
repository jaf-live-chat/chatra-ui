import { useCallback } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { LiveChatConversation, LiveChatWidgetConfig } from "../../../models/LiveChatModel";
import liveChatWidgetServices from "../../../services/liveChatWidgetServices";
import {
  CONVERSATION_ID_KEY,
  LEGACY_WIDGET_ACCENT_COLOR_KEY,
  MESSAGE_PAGE_LIMIT,
  WIDGET_ACCENT_COLOR_KEY,
  WIDGET_LOGO_KEY,
  WIDGET_TITLE_KEY,
  WIDGET_WELCOME_KEY,
} from "../constants";
import { getDefaultWelcomeMessage, getDefaultWidgetTitle, isConversationNotFoundError, normalizeMessages } from "../helpers";
import { clearStoredValue, writeStoredValue } from "../storage";
import type { QuickMessage, WidgetTranscriptMessage } from "../types";

type UseWidgetDataSyncParams = {
  apiKey: string;
  hasApiKey: boolean;
  visitorToken: string;
  widgetConfig: LiveChatWidgetConfig;
  conversationId: string;
  readPersistedSystemMessages: (targetConversationId: string) => WidgetTranscriptMessage[];
  setMessages: Dispatch<SetStateAction<WidgetTranscriptMessage[]>>;
  setConversationId: Dispatch<SetStateAction<string>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  getErrorMessage: (error: unknown) => string;
  isSubscriptionInactiveError: (error: unknown) => boolean;
  setWidgetConfig: Dispatch<SetStateAction<LiveChatWidgetConfig>>;
  setQuickMessages: Dispatch<SetStateAction<QuickMessage[]>>;
  setHistoryConversations: Dispatch<SetStateAction<LiveChatConversation[]>>;
  setHistoryCount: Dispatch<SetStateAction<number>>;
  setIsReturningVisitor: Dispatch<SetStateAction<boolean>>;
  setReturningVisitorName: Dispatch<SetStateAction<string>>;
  setIsHistoryLoading: Dispatch<SetStateAction<boolean>>;
  setHistoryError: Dispatch<SetStateAction<string>>;
  setPreChatFullName: Dispatch<SetStateAction<string>>;
  setPreChatEmailAddress: Dispatch<SetStateAction<string>>;
  setPreChatPhoneNumber: Dispatch<SetStateAction<string>>;
  setIsHistoryTranscriptLoading: Dispatch<SetStateAction<boolean>>;
  setHistoryMessages: Dispatch<SetStateAction<WidgetTranscriptMessage[]>>;
  widgetSettingsRequestRef: MutableRefObject<Promise<void> | null>;
  quickMessagesRequestRef: MutableRefObject<Promise<void> | null>;
  historyRequestRef: MutableRefObject<Promise<void> | null>;
  profileRequestRef: MutableRefObject<Promise<void> | null>;
  hasLoadedWidgetSettingsRef: MutableRefObject<boolean>;
  hasLoadedQuickMessagesRef: MutableRefObject<boolean>;
  hasLoadedHistoryRef: MutableRefObject<boolean>;
  hasLoadedProfileRef: MutableRefObject<boolean>;
};

export const useWidgetDataSync = ({
  apiKey,
  hasApiKey,
  visitorToken,
  widgetConfig,
  conversationId,
  readPersistedSystemMessages,
  setMessages,
  setConversationId,
  setErrorMessage,
  getErrorMessage,
  isSubscriptionInactiveError,
  setWidgetConfig,
  setQuickMessages,
  setHistoryConversations,
  setHistoryCount,
  setIsReturningVisitor,
  setReturningVisitorName,
  setIsHistoryLoading,
  setHistoryError,
  setPreChatFullName,
  setPreChatEmailAddress,
  setPreChatPhoneNumber,
  setIsHistoryTranscriptLoading,
  setHistoryMessages,
  widgetSettingsRequestRef,
  quickMessagesRequestRef,
  historyRequestRef,
  profileRequestRef,
  hasLoadedWidgetSettingsRef,
  hasLoadedQuickMessagesRef,
  hasLoadedHistoryRef,
  hasLoadedProfileRef,
}: UseWidgetDataSyncParams) => {
  const syncMessages = useCallback(async (targetConversationId: string) => {
    if (!apiKey || !targetConversationId) {
      return;
    }

    try {
      const response = await liveChatWidgetServices.getConversationMessages(
        widgetConfig,
        visitorToken,
        targetConversationId,
        { page: 1, limit: MESSAGE_PAGE_LIMIT },
      );
      const persistedSystemMessages = readPersistedSystemMessages(targetConversationId);
      const mergedMessages = [...response.messages, ...persistedSystemMessages];
      const dedupedMessages = mergedMessages.filter((message, index, source) => {
        return source.findIndex((entry) => String(entry._id) === String(message._id)) === index;
      });

      setMessages(normalizeMessages(dedupedMessages));
    } catch (error) {
      if (targetConversationId === conversationId && isConversationNotFoundError(error)) {
        setConversationId("");
        clearStoredValue(CONVERSATION_ID_KEY);
        setMessages([]);
        setErrorMessage("");
        return;
      }

      setErrorMessage(getErrorMessage(error));
    }
  }, [apiKey, conversationId, getErrorMessage, readPersistedSystemMessages, setConversationId, setErrorMessage, setMessages, visitorToken, widgetConfig]);

  const syncWidgetSettings = useCallback(async (force = false) => {
    if (!hasApiKey) {
      return;
    }

    if (hasLoadedWidgetSettingsRef.current && !force) {
      return;
    }

    if (widgetSettingsRequestRef.current) {
      return widgetSettingsRequestRef.current;
    }

    widgetSettingsRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getWidgetSettings({ apiKey }, visitorToken);
        const settings = response.widgetSettings;

        setWidgetConfig((currentConfig) => {
          const fallbackTitle = getDefaultWidgetTitle(currentConfig.companyName);
          const fallbackWelcomeMessage = getDefaultWelcomeMessage(currentConfig.companyName);
          const nextTitle = String(settings.widgetTitle || "").trim();
          const nextWelcomeMessage = String(settings.welcomeMessage || "").trim();
          const nextWidgetLogo = String(settings.widgetLogo || "").trim();
          const nextAccentColor = String(settings.accentColor || "").trim();
          const hasWidgetLogo = Object.prototype.hasOwnProperty.call(settings, "widgetLogo");
          const hasAccentColor = Object.prototype.hasOwnProperty.call(settings, "accentColor");

          if (nextTitle) {
            writeStoredValue(WIDGET_TITLE_KEY, nextTitle);
          }

          if (nextWelcomeMessage) {
            writeStoredValue(WIDGET_WELCOME_KEY, nextWelcomeMessage);
          }

          if (hasWidgetLogo) {
            if (nextWidgetLogo) {
              writeStoredValue(WIDGET_LOGO_KEY, nextWidgetLogo);
            } else {
              clearStoredValue(WIDGET_LOGO_KEY);
            }
          }

          if (hasAccentColor) {
            if (nextAccentColor) {
              writeStoredValue(WIDGET_ACCENT_COLOR_KEY, nextAccentColor);
              clearStoredValue(LEGACY_WIDGET_ACCENT_COLOR_KEY);
            } else {
              clearStoredValue(WIDGET_ACCENT_COLOR_KEY);
              clearStoredValue(LEGACY_WIDGET_ACCENT_COLOR_KEY);
            }
          }

          return {
            ...currentConfig,
            title: nextTitle || currentConfig.title || fallbackTitle,
            welcomeMessage: nextWelcomeMessage || currentConfig.welcomeMessage || fallbackWelcomeMessage,
            widgetLogo: hasWidgetLogo ? nextWidgetLogo : currentConfig.widgetLogo,
            accentColor: nextAccentColor || currentConfig.accentColor,
          };
        });
      } catch (error) {
        if (isSubscriptionInactiveError(error)) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        hasLoadedWidgetSettingsRef.current = true;
        widgetSettingsRequestRef.current = null;
      }
    })();

    return widgetSettingsRequestRef.current;
  }, [apiKey, hasApiKey, hasLoadedWidgetSettingsRef, setWidgetConfig, visitorToken, widgetSettingsRequestRef]);

  const syncQuickMessages = useCallback(async (force = false) => {
    if (!hasApiKey) {
      setQuickMessages([]);
      return;
    }

    if (hasLoadedQuickMessagesRef.current && !force) {
      return;
    }

    if (quickMessagesRequestRef.current) {
      return quickMessagesRequestRef.current;
    }

    quickMessagesRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getQuickMessages({ apiKey }, visitorToken, {
          page: 1,
          limit: 10,
        });

        setQuickMessages(response.quickMessages || []);
      } catch (error) {
        if (isSubscriptionInactiveError(error)) {
          setErrorMessage(getErrorMessage(error));
        }

        setQuickMessages([]);
      } finally {
        hasLoadedQuickMessagesRef.current = true;
        quickMessagesRequestRef.current = null;
      }
    })();

    return quickMessagesRequestRef.current;
  }, [apiKey, hasApiKey, hasLoadedQuickMessagesRef, quickMessagesRequestRef, setQuickMessages, visitorToken]);

  const syncConversationHistory = useCallback(async (force = false) => {
    if (!hasApiKey) {
      setHistoryConversations([]);
      setHistoryCount(0);
      setIsReturningVisitor(false);
      setReturningVisitorName("");
      return;
    }

    if (hasLoadedHistoryRef.current && !force) {
      return;
    }

    if (historyRequestRef.current) {
      return historyRequestRef.current;
    }

    setIsHistoryLoading(true);
    setHistoryError("");

    historyRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getConversationHistory({ apiKey }, visitorToken, {
          page: 1,
          limit: 20,
        });

        setHistoryConversations(response.conversations || []);
        setHistoryCount(response.historyCount || 0);
        setIsReturningVisitor(Boolean(response.isReturningVisitor));
        setReturningVisitorName(String(response.visitor?.name || response.visitor?.fullName || "").trim());
      } catch (error) {
        if (isSubscriptionInactiveError(error)) {
          setErrorMessage(getErrorMessage(error));
        }

        setHistoryConversations([]);
        setHistoryCount(0);
        setHistoryError("Unable to load chat history.");
      } finally {
        hasLoadedHistoryRef.current = true;
        setIsHistoryLoading(false);
        historyRequestRef.current = null;
      }
    })();

    return historyRequestRef.current;
  }, [apiKey, hasApiKey, hasLoadedHistoryRef, historyRequestRef, setHistoryConversations, setHistoryCount, setHistoryError, setIsHistoryLoading, setIsReturningVisitor, setReturningVisitorName, visitorToken]);

  const syncVisitorProfile = useCallback(async (force = false) => {
    if (!hasApiKey) {
      return;
    }

    if (hasLoadedProfileRef.current && !force) {
      return;
    }

    if (profileRequestRef.current) {
      return profileRequestRef.current;
    }

    profileRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getVisitorProfile({ apiKey }, visitorToken);
        const visitor = response.visitor;

        setPreChatFullName(String(visitor?.name || visitor?.fullName || ""));
        setPreChatEmailAddress(String(visitor?.emailAddress || ""));
        setPreChatPhoneNumber(String(visitor?.phoneNumber || ""));
      } catch (error) {
        if (isSubscriptionInactiveError(error)) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        hasLoadedProfileRef.current = true;
        profileRequestRef.current = null;
      }
    })();

    return profileRequestRef.current;
  }, [apiKey, hasApiKey, hasLoadedProfileRef, profileRequestRef, setPreChatEmailAddress, setPreChatFullName, setPreChatPhoneNumber, visitorToken]);

  const syncBootstrapData = useCallback(async () => {
    await Promise.allSettled([
      syncWidgetSettings(),
      syncQuickMessages(),
      syncConversationHistory(),
      syncVisitorProfile(),
    ]);
  }, [syncConversationHistory, syncQuickMessages, syncVisitorProfile, syncWidgetSettings]);

  const loadHistoryTranscript = useCallback(async (targetConversationId: string) => {
    if (!hasApiKey || !targetConversationId) {
      return;
    }

    setIsHistoryTranscriptLoading(true);

    try {
      const response = await liveChatWidgetServices.getConversationMessages(
        widgetConfig,
        visitorToken,
        targetConversationId,
        { page: 1, limit: MESSAGE_PAGE_LIMIT },
      );

      setHistoryMessages(normalizeMessages(response.messages));
      setHistoryError("");
    } catch (error) {
      if (isSubscriptionInactiveError(error)) {
        setErrorMessage(getErrorMessage(error));
      }

      setHistoryMessages([]);
      setHistoryError("Unable to load transcript.");
    } finally {
      setIsHistoryTranscriptLoading(false);
    }
  }, [getErrorMessage, hasApiKey, isSubscriptionInactiveError, setErrorMessage, setHistoryError, setHistoryMessages, setIsHistoryTranscriptLoading, visitorToken, widgetConfig]);

  return {
    syncMessages,
    syncWidgetSettings,
    syncQuickMessages,
    syncConversationHistory,
    syncVisitorProfile,
    syncBootstrapData,
    loadHistoryTranscript,
  };
};
