export enum Country {
  USA = 'USA',
  CANADA = 'Canada',
  MEXICO = 'Mexico'
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64
}

export interface GroundingSource {
  title?: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: Attachment[];
  groundingSources?: GroundingSource[];
  isThinking?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedCountry: Country;
}