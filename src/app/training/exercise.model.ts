export interface Exercise {
  id: string;
  uid: string;
  name: string;
  duration: number;
  calories: number;
  date?: Date;
  state?: 'completed' | 'cancelled' | null;
}
