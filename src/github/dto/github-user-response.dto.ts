export class GithubUserResponseDto {
  id: number;
  github_username: string;
  github_id?: number;
  avatar_url?: string;
  name?: string;
  email?: string;
  bio?: string;
  createdat?: Date;
  updatedat?: Date;
}