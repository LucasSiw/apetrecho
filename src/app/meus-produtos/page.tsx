"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Package, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useProducts } from "@/context/products-context"
import { ProductForm } from "@/components/product-form"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/app/hooks/use-toast"
import type { Product } from "@/types/product"

export default function MeusProdutosPage() {
  const { user } = useAuth()
  const { userProducts, loading, deleteProduct } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    setIsDeleting(true)
    try {
      const result = await deleteProduct(productId)
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        })
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmation(null)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Meus Produtos</h1>
            <p className="text-muted-foreground">Gerencie os produtos que você cadastrou na plataforma</p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null)
              setShowForm(true)
            }}
            className="mt-4 md:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando produtos...</span>
          </div>
        ) : userProducts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground text-center mb-6">
                Você ainda não cadastrou nenhum produto. Comece adicionando seu primeiro produto agora.
              </p>
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setShowForm(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=400"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm px-3 py-1">
                        Esgotado
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    </div>
                    {product.isNew && <Badge variant="secondary">Novo</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{formatPrice(product.price)}</p>
                      <p className="text-sm text-muted-foreground">Estoque: {product.stock || 0} unidades</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {product.category || "Sem categoria"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleEdit(product)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteConfirmation(product.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Formulário de Produto */}
        <ProductForm isOpen={showForm} onClose={() => setShowForm(false)} product={editingProduct} />

        {/* Diálogo de Confirmação de Exclusão */}
        <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmation(null)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmation && handleDelete(deleteConfirmation)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <SiteFooter />
    </div>
  )
}
