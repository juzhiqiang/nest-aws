export interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date | null; // 允许 null
  updatedAt: Date | null; // 允许 null
}
