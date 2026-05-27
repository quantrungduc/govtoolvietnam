export interface Violation {
  element: string;
  severity: string; // 'Lỗi nghiêm trọng' | 'Cảnh báo' | 'Khuyến nghị'
  description: string;
  originalText?: string;
  suggestion: string;
}

export interface CheckTheThucResponse {
  score: number;
  overallReview: string;
  violations: Violation[];
  standardTemplate: string;
}

export interface SpellingIssue {
  type: string; // 'spelling' | 'grammar' | 'style'
  original: string;
  corrected: string;
  reason: string;
  index?: string;
}

export interface CheckSpellingResponse {
  correctedText: string;
  issues: SpellingIssue[];
}

export interface Citation {
  source: string;
  clause: string;
  summaryContent: string;
  citationPhrase: string;
}

export interface SmartCitationResponse {
  summary: string;
  citations: Citation[];
  openingCitationDraft: string;
  searchSources?: Array<{ title: string; uri: string }>;
}

export interface AssignedTask {
  taskName: string;
  assignee: string;
  cooperator?: string;
  deadline: string;
}

export interface BocBangResponse {
  meetingTitle: string;
  keyDecisions: string[];
  assignedTasks: AssignedTask[];
  documentDraft: string;
}
