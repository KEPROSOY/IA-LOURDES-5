export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type UserType = 'estudiante' | 'investigador';

export interface ChatConfig {
  userType: UserType;
  maxHistory: number;
}
