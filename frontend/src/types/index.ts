export interface Movie {
  id: string
  title: string
  description: string
  release_date: string
  rating: number | null
  image_link: string
}

export interface UserPublic {
  user_id: string
  email: string
  firstname: string
  lastname: string
}

export interface Hated {
  user_id: string
  movie_id: string
  movie?: Movie
}

export interface Evaluation {
  evaluation_id: string
  hating: number
  comment: string | null
  comment_deleted: boolean
  hates_count: number
  has_hated?: boolean
  created_at: string
  updated_at: string
  user?: UserPublic
  movie?: Movie
}

export interface EvaluationStats {
  average_hating: number | null
  total_reviews: number
}

export interface DecodedToken {
  userId: string
  is_admin: boolean
  firstname: string
  iat: number
  exp: number
}
