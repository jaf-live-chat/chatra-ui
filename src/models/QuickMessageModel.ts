export interface QuickMessageRecord {
  _id: string;
  title: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetQuickMessagesResponse {
  success: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  quickMessages: QuickMessageRecord[];
}

export interface GetQuickMessageByIdResponse {
  success: boolean;
  quickMessage: QuickMessageRecord;
}

export interface CreateQuickMessagePayload {
  title: string;
  response: string;
}

export interface UpdateQuickMessagePayload {
  title?: string;
  response?: string;
}

export interface CreateQuickMessageResponse {
  success: boolean;
  message: string;
  quickMessage: QuickMessageRecord;
}

export interface UpdateQuickMessageResponse {
  success: boolean;
  message: string;
  quickMessage: QuickMessageRecord;
}

export interface DeleteQuickMessageResponse {
  success: boolean;
  message: string;
}

export interface UseGetQuickMessagesParams {
  page?: number;
  limit?: number;
}
