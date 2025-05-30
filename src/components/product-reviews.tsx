"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
  helpful: number
  notHelpful: number
  verified: boolean
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Carregar avaliações do localStorage
    const storedReviews = localStorage.getItem(`reviews_${productId}`)
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews))
    } else {
      // Avaliações de exemplo
      const exampleReviews: Review[] = [
        {
          id: "1",
          userId: "user1",
          userName: "João Silva",
          rating: 5,
          comment: "Produto excelente! Superou minhas expectativas. Entrega rápida e embalagem perfeita.",
          date: "2024-01-15",
          helpful: 12,
          notHelpful: 1,
          verified: true,
        },
        {
          id: "2",
          userId: "user2",
          userName: "Maria Santos",
          rating: 4,
          comment: "Muito bom produto, qualidade ótima. Apenas o preço que achei um pouco alto.",
          date: "2024-01-10",
          helpful: 8,
          notHelpful: 0,
          verified: true,
        },
        {
          id: "3",
          userId: "user3",
          userName: "Pedro Costa",
          rating: 5,
          comment: "Recomendo! Produto de alta qualidade e atendimento excelente.",
          date: "2024-01-05",
          helpful: 15,
          notHelpful: 2,
          verified: false,
        },
      ]
      setReviews(exampleReviews)
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(exampleReviews))
    }
  }, [productId])

  const handleSubmitReview = async () => {
    if (!user || !newReview.comment.trim()) return

    setLoading(true)

    const review: Review = {
      id: `review_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0],
      helpful: 0,
      notHelpful: 0,
      verified: true,
    }

    const updatedReviews = [review, ...reviews]
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews))

    setNewReview({ rating: 5, comment: "" })
    setShowForm(false)
    setLoading(false)
  }

  const handleHelpful = (reviewId: string, type: "helpful" | "notHelpful") => {
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          [type]: review[type] + 1,
        }
      }
      return review
    })
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews))
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0 ? (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Resumo das Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações dos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">{reviews.length} avaliações</p>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Nova Avaliação */}
      {user && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sua Avaliação</CardTitle>
              {!showForm && <Button onClick={() => setShowForm(true)}>Avaliar Produto</Button>}
            </div>
          </CardHeader>
          {showForm && (
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nota:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button key={rating} onClick={() => setNewReview({ ...newReview, rating })} className="p-1">
                      <Star
                        className={`h-6 w-6 ${
                          rating <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comentário:</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Conte sua experiência com o produto..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} disabled={loading || !newReview.comment.trim()}>
                  {loading ? "Enviando..." : "Enviar Avaliação"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.userName}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Compra Verificada
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{review.comment}</p>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Esta avaliação foi útil?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpful(review.id, "helpful")}
                  className="text-green-600 hover:text-green-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Sim ({review.helpful})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpful(review.id, "notHelpful")}
                  className="text-red-600 hover:text-red-700"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Não ({review.notHelpful})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
