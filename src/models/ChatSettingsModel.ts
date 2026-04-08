export type QueueAssignmentMode = "MANUAL" | "ROUND_ROBIN";

export interface ChatSettingsRecord {
  _id: string;
  assignmentMode: QueueAssignmentMode;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateQueueAssignmentModePayload {
  assignmentMode: QueueAssignmentMode;
}

export interface GetQueueAssignmentModeResponse {
  success: boolean;
  message: string;
  chatSettings: ChatSettingsRecord;
}

export interface UpdateQueueAssignmentModeResponse {
  success: boolean;
  message: string;
  chatSettings: ChatSettingsRecord;
}
