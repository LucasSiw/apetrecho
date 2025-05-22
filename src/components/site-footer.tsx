import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} E-Shop. Todos os direitos reservados.
        </p>
        <div className="flex gap-4">
          <Link href="/termos" className="text-sm text-muted-foreground hover:underline">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="text-sm text-muted-foreground hover:underline">
            Política de Privacidade
          </Link>
          <Link href="/ajuda" className="text-sm text-muted-foreground hover:underline">
            Ajuda
          </Link>
        </div>
      </div>
    </footer>
  )
}
