export type SidebarItem = {
  id: number;
  externalPath: string;
  path: string;
  name: string;
  icon: string;
  new?: boolean;
  scope?: string | string[];
  warning?: boolean | string | number;
  experimentsRequired?: string[];
  click?: (instance: any) => void;
  exact?: boolean;
};
