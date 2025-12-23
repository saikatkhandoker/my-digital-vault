export interface LinkCategory {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: string;
}

export interface LinkContextType {
  links: Link[];
  linkCategories: LinkCategory[];
  searchQuery: string;
  selectedCategory: string | null;
  isLoading: boolean;
  addLink: (link: Omit<Link, 'id' | 'createdAt'>) => void;
  updateLink: (id: string, link: Partial<Omit<Link, 'id' | 'createdAt'>>) => void;
  deleteLink: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  addLinkCategory: (category: Omit<LinkCategory, 'id'>) => void;
  updateLinkCategory: (id: string, category: Omit<LinkCategory, 'id'>) => void;
  deleteLinkCategory: (id: string) => void;
  getParentCategories: () => LinkCategory[];
  getSubcategories: (parentId: string) => LinkCategory[];
}
