export interface QuickReplyRecord {
  _id: string;
  title: string;
  category: string;
  message: string;
  isPosted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuickRepliesPagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export interface GetQuickRepliesResponse {
  success: boolean;
  message: string;
  quickReplies: QuickReplyRecord[];
  pagination: QuickRepliesPagination;
}

export interface GetQuickReplyByIdResponse {
  success: boolean;
  message: string;
  quickReply: QuickReplyRecord;
}

export interface CreateQuickReplyPayload {
  title: string;
  category: string;
  message: string;
  isPosted?: boolean;
}

export interface UpdateQuickReplyPayload {
  title?: string;
  category?: string;
  message?: string;
  isPosted?: boolean;
}

export interface CreateQuickReplyResponse {
  success: boolean;
  message: string;
  quickReply: QuickReplyRecord;
}

export interface UpdateQuickReplyResponse {
  success: boolean;
  message: string;
  quickReply: QuickReplyRecord;
}

export interface DeleteQuickReplyResponse {
  success: boolean;
  message: string;
}

export interface UseGetQuickRepliesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isPosted?: boolean;
}