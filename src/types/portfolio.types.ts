export interface PortfolioProject {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  screenshots: string[];
  liveUrl: string;
  githubUrl: string;
  technologyStack: string[];
  category: string;
  featured: boolean;
  displayOrder: number;
  status: 'published' | 'draft';
  clientInfo: {
    name: string;
    company: string;
  };
  createdBy: string;
  rating?: {
    averageRating: number;
    reviewCount: number;
  };
  reviews?: ProjectReview[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewClient {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface ProjectReview {
  _id: string;
  project: string | PortfolioProject;
  client: string | ReviewClient;
  rating: number;
  review: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioCategory {
  _id: string;
  name: string;
  count: number;
}

export interface PortfolioPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PortfolioApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PortfolioPagination;
}

export interface CreatePortfolioData {
  title: string;
  description: string;
  thumbnail?: string;
  screenshots?: string[];
  liveUrl?: string;
  githubUrl?: string;
  technologyStack?: string[];
  category?: string;
  featured?: boolean;
  displayOrder?: number;
  status?: 'published' | 'draft';
  clientInfo?: {
    name: string;
    company: string;
  };
}

export interface UpdatePortfolioData extends Partial<CreatePortfolioData> {}

export interface CreateReviewData {
    projectId: string;
    rating: number;
    review: string;
}

export interface UpdateReviewData {
  rating?: number;
  review?: string;
}

export interface ReorderData {
  order: { id: string; displayOrder: number }[];
}
