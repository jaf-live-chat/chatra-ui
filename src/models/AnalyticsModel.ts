export interface AnalyticsOverview {
  totalChats: number;
  totalUsers: number;
  totalMessages: number;
  averageResponseTimeSeconds: number | null;
  averageResolutionTimeSeconds: number | null;
}

export interface AnalyticsTrends {
  totalChatsPercent: number;
  totalUsersPercent: number;
  totalMessagesPercent: number;
  averageResponseTimePercent: number;
}

export interface AnalyticsConversationVolumePoint {
  day: string;
  totalChats: number;
  resolved: number;
}

export interface AnalyticsAgentPerformanceEntry {
  agentId: string;
  agentName: string;
  resolvedChats: number;
  avgFirstResponseSeconds: number | null;
  avgResolutionSeconds: number | null;
}

export interface AnalyticsCustomerSegmentation {
  newUsers: number;
  returningUsers: number;
}

export interface AnalyticsOperations {
  missedChats: number;
  slowResponses: number;
}

export interface AnalyticsConversion {
  totalChats: number;
  leadChats: number;
  chatToLeadPercent: number;
}

export interface AnalyticsConversationInsights {
  topKeywords: Array<{
    keyword: string;
    count: number;
  }>;
}

export interface AnalyticsLocationBreakdownEntry {
  location: string;
  visitorCount: number;
}

export interface AnalyticsLocationSourceEntry {
  source: string;
  visitorCount: number;
}

export interface AnalyticsVisitorLocations {
  totalVisitors: number;
  visitorsWithLocation: number;
  topCountries: AnalyticsLocationBreakdownEntry[];
  topCities: AnalyticsLocationBreakdownEntry[];
  locationSources: AnalyticsLocationSourceEntry[];
}

export interface LiveChatAnalytics {
  periodDays: number;
  dateRange: {
    from: string;
    to: string;
  };
  overview: AnalyticsOverview;
  trends: AnalyticsTrends;
  conversationVolume: AnalyticsConversationVolumePoint[];
  advanced: {
    agentPerformance: AnalyticsAgentPerformanceEntry[];
    customerSegmentation: AnalyticsCustomerSegmentation;
    operations: AnalyticsOperations;
    conversion: AnalyticsConversion;
    conversationInsights: AnalyticsConversationInsights;
    visitorLocations: AnalyticsVisitorLocations;
  };
}

export interface GetLiveChatAnalyticsSummaryResponse {
  success: boolean;
  analytics: LiveChatAnalytics;
}
