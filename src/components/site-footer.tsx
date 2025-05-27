import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-xs sm:text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Apetrecho. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/termos" className="text-xs sm:text-sm text-muted-foreground hover:underline transition-colors">
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="text-xs sm:text-sm text-muted-foreground hover:underline transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link href="/ajuda" className="text-xs sm:text-sm text-muted-foreground hover:underline transition-colors">
              Ajuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
