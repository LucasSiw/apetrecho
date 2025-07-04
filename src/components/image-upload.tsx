"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, Camera, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens`)
      return
    }

    setUploading(true)

    try {
      const newImageUrls: string[] = []

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} não é uma imagem válida`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} é muito grande. Máximo 5MB por imagem`)
          continue
        }

        const url = await uploadImageToServer(file)
        newImageUrls.push(url)
      }

      onImagesChange([...images, ...newImageUrls])
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error)
      alert("Erro ao processar as imagens")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) throw new Error("Falha no upload")

    const data = await response.json()
    return data.url // retorna o caminho, ex: "/uploads/123-img.jpg"
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <Label className="text-sm font-medium">Imagens do Produto</Label>
      <p className="text-xs text-muted-foreground mb-3">
        Adicione até {maxImages} fotos do seu produto (máximo 5MB cada)
      </p>

      <div className="mb-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={uploading || images.length >= maxImages}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {images.length === 0 ? "Adicionar Fotos" : `Adicionar Mais Fotos (${images.length}/${maxImages})`}
            </>
          )}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Produto ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">
                  Foto {index + 1}
                  {index === 0 && " (Principal)"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhuma imagem adicionada
              <br />
              Clique no botão acima para adicionar fotos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
