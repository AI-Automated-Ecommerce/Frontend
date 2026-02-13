export interface BusinessDetail {
  id: number;
  title: string;
  content: string;
  updated_at?: string;
}

export interface BusinessDetailCreate {
  title: string;
  content: string;
}

export interface BusinessDetailUpdate {
  title?: string;
  content?: string;
}
