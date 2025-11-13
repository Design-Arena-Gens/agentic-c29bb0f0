export type InteractionType = "Call" | "Email" | "Meeting" | "Note";

export type Stage = "Lead" | "Active" | "Waiting" | "Customer";

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  summary: string;
  nextSteps?: string;
}

export interface ContactTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ContactRecord {
  id: string;
  name: string;
  company: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  tags: string[];
  stage: Stage;
  createdAt: string;
  lastInteraction: string;
  interactions: Interaction[];
  tasks: ContactTask[];
}

export interface CRMState {
  contacts: ContactRecord[];
}
