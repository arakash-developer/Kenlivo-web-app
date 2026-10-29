export interface ProductType {
  _id: string
  name: string
  category: string
  price: number
  finalPrice?: number
  discountPercentage?: number
  discount?: string | number
  volume?: number
  tagline?: string
  producttagline?: string
  images?: string[]
  imageUrl?: string
  description: string
  rating?: number
  numReviews?: number
  stock?: number
  isActive?: boolean
}

export interface OrderDataType {
  _id: string
  username: string
  email: string
  name: string
  category: string
  price: string
  producttagline: string
  imageUrl: string
  description: string
}

