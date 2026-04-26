export interface Framework {
  id: string;
  title: string;
  subtitle: string;
  sector: string;
  date: string;
  tags: string[];
  lite_content: string;
  full_content: string;
  views: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subscriber {
  email: string;
  subscribed_at: string;
}
