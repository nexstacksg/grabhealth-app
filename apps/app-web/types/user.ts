export interface User {
  id: number;
  name: string;
  email: string;
  image_url?: string;
  created_at?: string;
  password_hash?: string;
  password_salt?: string;
  role?: 'admin' | 'customer' | 'sales' | 'leader' | 'manager' | 'company';
}
