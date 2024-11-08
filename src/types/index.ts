export type TeamMember = {
  name: string;
  next: boolean;
  skip: number;
  OOO: string | null;
  requirements: string[];
};

export type TeamDataResponse = {
  success: boolean;
  data: TeamMember[];
  error?: string;
};
