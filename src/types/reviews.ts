export interface Review {
  id: number;
  nota: number;
  comentario: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview extends Review {
  author: {
    name: string;
  };
}

export interface MyReviewResponse {
  review: Review | null;
}

export interface ReviewsPage {
  items: PublicReview[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SaveReviewResult {
  id: number;
  averageRating: number;
  totalReviews: number;
}