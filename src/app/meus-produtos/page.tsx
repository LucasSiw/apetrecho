"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Package, Loader2, Eye, Database } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useProducts } from "@/context/products-context"
import { ProductForm } from "@/components/product-form"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/app/hooks/use-toast"
import type { Product } from "@/types/product"
import { testDatabaseConnection } from "@/lib/actions/products"

export default function MeusProdutosPage() {
  const { user } = useAuth()
  const { userProducts, loading, deleteProduct, refreshUserProducts } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dbTestResult, setDbTestResult] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Testar conexão com banco
  const testDb = async () => {
    try {
      const result = await testDatabaseConnection()
      setDbTestResult(result)
      console.log("Resultado do teste de DB:", result)

      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Erro no teste de DB:", error)
      toast({
        title: "Erro",
        description: "Erro ao testar conexão com banco",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!user) {
      console.log("Redirecionando para home - usuário não logado")
      router.push("/")
      return
    }

    console.log("Usuário logado:", user)
    console.log("Produtos do usuário:", userProducts)
  }, [user, router, userProducts])

  const handleEdit = (product: Product) => {
    console.log("Editando produto:", product)
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!user) return

    setIsDeleting(true)
    try {
      console.log("Excluindo produto:", productId)
      const result = await deleteProduct(productId)
      console.log("Resultado da exclusão:", result)

      if (!result.success) {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
      // O toast de sucesso já é mostrado no contexto
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir produto. Verifique o console.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmation(null)
    }
  }

  const handleFormClose = () => {
    console.log("Fechando formulário")
    setShowForm(false)
    setEditingProduct(null)
    // O contexto já recarrega automaticamente após operações CRUD
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const getStatusBadge = (stock: number) => {
    if (stock > 0) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Disponível
        </Badge>
      )
    }
    return <Badge variant="destructive">Indisponível</Badge>
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8 md:py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Meus Produtos</h1>
            <p className="text-muted-foreground">Gerencie os produtos que você cadastrou na plataforma</p>
            {userProducts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {userProducts.length} produto{userProducts.length !== 1 ? "s" : ""} cadastrado
                {userProducts.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Debug Info */}
            <div className="mt-2 text-xs text-muted-foreground">
              <p>ID do usuário: {user.id}</p>
              {dbTestResult && (
                <p className={dbTestResult.success ? "text-green-600" : "text-red-600"}>DB: {dbTestResult.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={testDb}>
              <Database className="mr-2 h-4 w-4" /> Testar DB
            </Button>
            <Button variant="outline" onClick={refreshUserProducts}>
              <Loader2 className="mr-2 h-4 w-4" /> Atualizar
            </Button>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setShowForm(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Carregando produtos do banco de dados...</span>
          </div>
        ) : userProducts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Você ainda não cadastrou nenhum produto no banco de dados. Comece adicionando seu primeiro produto agora
                e disponibilize-o para aluguel na plataforma.
              </p>
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setShowForm(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=400"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=400"
                    }}
                  />
                  <div className="absolute top-2 right-2">{getStatusBadge(product.stock ?? 0)}</div>
                  {product.isNew && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-500 hover:bg-blue-600">Novo</Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {product.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xl text-primary">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Categoria: {product.category || "Geral"}</span>
                      <span className="text-muted-foreground">ID: {product.id}</span>
                    </div>
                    {product.installments && (
                      <div className="text-sm text-muted-foreground">
                        {product.installments.count}x de {formatPrice(product.installments.value)}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/produto/${product.id}`)}>
                    <Eye className="mr-2 h-4 w-4" /> Ver
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmation(product.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Formulário de Produto */}
        <ProductForm isOpen={showForm} onClose={handleFormClose} product={editingProduct} />

        {/* Diálogo de Confirmação de Exclusão */}
        <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita e o produto será removido
                permanentemente da plataforma.
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
                    Excluir Produto
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
