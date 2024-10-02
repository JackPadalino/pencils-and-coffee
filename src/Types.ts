export type User = {
  id: string;
  name: string;
  headline: string;
  postalCode: string;
  location: string;
  about: string;
  classes: { grade: number; subject: string }[];
};
