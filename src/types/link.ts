export interface Link {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  tags: string[];
  createdAt: string;
}

export interface LinkContextType {
  links: Link[];
  searchQuery: string;
  addLink: (link: Omit<Link, 'id' | 'createdAt'>) => void;
  updateLink: (id: string, link: Partial<Omit<Link, 'id' | 'createdAt'>>) => void;
  deleteLink: (id: string) => void;
  setSearchQuery: (query: string) => void;
}
