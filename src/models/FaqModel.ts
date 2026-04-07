export interface FaqModel {
  _id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetFaqsResponse {
  success: boolean;
  count: number;
  faqs: FaqModel[];
}

export interface SingleFaqResponse {
  success: boolean;
  faq: FaqModel;
}

export interface CreateFaqPayload {
  question: string;
  answer: string;
  order?: number;
}

export interface UpdateFaqPayload {
  question?: string;
  answer?: string;
  order?: number;
}

export interface MutationFaqResponse {
  success: boolean;
  message: string;
  faq?: FaqModel;
}

export interface ReorderFaqPayload {
  ids: string[];
}

export interface ReorderFaqResponse {
  success: boolean;
  message: string;
  count: number;
  faqs: FaqModel[];
}
