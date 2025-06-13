"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"
import { X, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function CouponInput() {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [error, setError] = useState("")

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return

    const success = applyCoupon(couponCode.trim())

    if (success) {
      setCouponCode("")
      setError("")
    } else {
      setError("Cupom inválido ou não aplicável")
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setError("")
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Cupom aplicado: {appliedCoupon.code}</span>
          <Badge variant="secondary" className="text-xs">
            {appliedCoupon.type === "percentage"
              ? `${appliedCoupon.discount}% OFF`
              : `R$ ${appliedCoupon.discount} OFF`}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveCoupon}
          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Código do cupom"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase())
            setError("")
          }}
          className="flex-1"
        />
        <Button onClick={handleApplyCoupon} disabled={!couponCode.trim()} size="sm">
          Aplicar
        </Button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="text-xs text-muted-foreground">
        <p>Cupons disponíveis para teste:</p>
        <p>• DESCONTO10 (10% de desconto)</p>
        <p>• FRETE50 (R$ 50 de desconto)</p>
        <p>• PRIMEIRA20 (20% - pedido mín. R$ 100)</p>
      </div>
    </div>
  )
}
