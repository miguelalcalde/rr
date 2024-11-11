export interface TeamMember {
  name: string;
  next: boolean;
  skip: number;
  OOO: string;
  requirements: string[];
  aes: string;
}

export type TeamDataResponse = {
  success: boolean;
  data: TeamMember[];
  error?: string;
};
