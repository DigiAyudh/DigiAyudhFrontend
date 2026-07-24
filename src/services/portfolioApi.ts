import axios from 'axios';
import { tokenManager } from '../utils/tokenManager';
import type {
  PortfolioProject,
  ProjectReview,
  PortfolioApiResponse,
  CreatePortfolioData,
  UpdatePortfolioData,
  CreateReviewData,
  UpdateReviewData,
  ReorderData,
} from '../types/portfolio.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const portfolioClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
});

portfolioClient.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

portfolioClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          tokenManager.setToken(token);
          if (newRefreshToken) {
            tokenManager.setRefreshToken(newRefreshToken);
          }
          error.config.headers.Authorization = `Bearer ${token}`;
          return portfolioClient(error.config);
        } catch {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

const PORTFOLIO_BASE = '/portfolio';
const REVIEWS_BASE = '/reviews';

export const portfolioApi = {
  // ============ PUBLIC ENDPOINTS ============

  getFeaturedProjects: async (): Promise<PortfolioApiResponse<PortfolioProject[]>> => {
    const response = await portfolioClient.get(`${PORTFOLIO_BASE}/featured`);
    return response.data;
  },

  getAllProjects: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<PortfolioApiResponse<PortfolioProject[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);
    const query = queryParams.toString();
    const response = await portfolioClient.get(`${PORTFOLIO_BASE}${query ? `?${query}` : ''}`);
    return response.data;
  },

  getProjectById: async (id: string): Promise<PortfolioApiResponse<PortfolioProject>> => {
    const response = await portfolioClient.get(`${PORTFOLIO_BASE}/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<PortfolioApiResponse<string[]>> => {
    const response = await portfolioClient.get(`${PORTFOLIO_BASE}/categories`);
    return response.data;
  },

  // ============ REVIEW ENDPOINTS ============

  getProjectReviews: async (projectId: string): Promise<PortfolioApiResponse<ProjectReview[]>> => {
    const response = await portfolioClient.get(`${REVIEWS_BASE}/project/${projectId}`);
    return response.data;
  },

  createReview: async (data: CreateReviewData): Promise<PortfolioApiResponse<ProjectReview>> => {
    const response = await portfolioClient.post(REVIEWS_BASE, data);
    return response.data;
  },

  updateReview: async (id: string, data: UpdateReviewData): Promise<PortfolioApiResponse<ProjectReview>> => {
    const response = await portfolioClient.put(`${REVIEWS_BASE}/${id}`, data);
    return response.data;
  },

  getMyReviews: async (): Promise<PortfolioApiResponse<ProjectReview[]>> => {
    const response = await portfolioClient.get(`${REVIEWS_BASE}/my-reviews`);
    return response.data;
  },

  // ============ ADMIN PORTFOLIO ENDPOINTS ============

  adminGetAllProjects: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PortfolioApiResponse<PortfolioProject[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    const query = queryParams.toString();
    const response = await portfolioClient.get(`${PORTFOLIO_BASE}/admin/all${query ? `?${query}` : ''}`);
    return response.data;
  },

  createProject: async (data: CreatePortfolioData): Promise<PortfolioApiResponse<PortfolioProject>> => {
    const response = await portfolioClient.post(PORTFOLIO_BASE, data);
    return response.data;
  },

  updateProject: async (id: string, data: UpdatePortfolioData): Promise<PortfolioApiResponse<PortfolioProject>> => {
    const response = await portfolioClient.put(`${PORTFOLIO_BASE}/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<PortfolioApiResponse<null>> => {
    const response = await portfolioClient.delete(`${PORTFOLIO_BASE}/${id}`);
    return response.data;
  },

  uploadImages: async (files: File[]): Promise<PortfolioApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await portfolioClient.post(`${PORTFOLIO_BASE}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  toggleFeatured: async (id: string): Promise<PortfolioApiResponse<PortfolioProject>> => {
    const response = await portfolioClient.patch(`${PORTFOLIO_BASE}/${id}/featured`);
    return response.data;
  },

  reorderFeatured: async (data: ReorderData): Promise<PortfolioApiResponse<PortfolioProject[]>> => {
    const response = await portfolioClient.patch(`${PORTFOLIO_BASE}/reorder`, data);
    return response.data;
  },

  // ============ ADMIN REVIEW ENDPOINTS ============

  adminGetAllReviews: async (): Promise<PortfolioApiResponse<ProjectReview[]>> => {
    const response = await portfolioClient.get(`${REVIEWS_BASE}/admin/all`);
    return response.data;
  },

  approveReview: async (id: string): Promise<PortfolioApiResponse<ProjectReview>> => {
    const response = await portfolioClient.patch(`${REVIEWS_BASE}/${id}/approve`);
    return response.data;
  },

  rejectReview: async (id: string): Promise<PortfolioApiResponse<ProjectReview>> => {
    const response = await portfolioClient.patch(`${REVIEWS_BASE}/${id}/reject`);
    return response.data;
  },

  deleteReview: async (id: string): Promise<PortfolioApiResponse<null>> => {
    const response = await portfolioClient.delete(`${REVIEWS_BASE}/${id}`);
    return response.data;
  },
};
