"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { CouponInput } from "@/components/coupon-input"
import { Badge } from "@/components/ui/badge"

export function OrderSummary() {
  const { cartItems, appliedCoupon, getSubtotal, getDiscount, getTotal } = useCart()

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shipping = subtotal > 99 ? 0 : 15
  const total = getTotal() + shipping

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Itens */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Cupom */}
        <CouponInput />

        <Separator />

        {/* Cálculos */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-2">
                Desconto
                {appliedCoupon && (
                  <Badge variant="secondary" className="text-xs">
                    {appliedCoupon.code}
                  </Badge>
                )}
              </span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Frete</span>
            <span>{shipping === 0 ? <span className="text-green-600">Grátis</span> : formatPrice(shipping)}</span>
          </div>

          {shipping === 0 && subtotal > 99 && <p className="text-xs text-green-600">🎉 Você ganhou frete grátis!</p>}
        </div>

        <Separator />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
