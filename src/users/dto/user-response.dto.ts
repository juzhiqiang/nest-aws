export interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}