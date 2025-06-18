import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Central de Ajuda</h1>
            <p className="text-muted-foreground mb-8">Encontre respostas para suas perguntas mais frequentes.</p>

            <div className="grid w-full gap-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como faço para criar uma conta?</AccordionTrigger>
                  <AccordionContent>
                    Para criar uma conta, clique no botão "Entrar" no canto superior direito da página. Em seguida,
                    selecione a opção "Registrar" e preencha o formulário com suas informações.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como adicionar produtos ao carrinho?</AccordionTrigger>
                  <AccordionContent>
                    Para adicionar um produto ao carrinho, navegue até a página do produto desejado e clique no botão
                    "Adicionar ao Carrinho". Você pode ajustar a quantidade na página do carrinho.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Quais são as formas de pagamento aceitas?</AccordionTrigger>
                  <AccordionContent>
                    Aceitamos cartões de crédito, débito, boleto bancário, PIX e transferência bancária.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Como acompanhar meu pedido?</AccordionTrigger>
                  <AccordionContent>
                    Após fazer login, acesse a seção "Meus Pedidos" no seu perfil para acompanhar o status de entrega
                    dos seus pedidos.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                  <CardDescription>Entre em contato com nossa equipe de suporte</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Email: suporte@seusite.com</p>
                  <p>Telefone: (11) 1234-5678</p>
                  <p>Horário: Segunda a Sexta, 9h às 18h</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Política de Devolução</CardTitle>
                  <CardDescription>Informações sobre trocas e devoluções</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Você tem até 7 dias após o recebimento para solicitar a devolução de um produto.</p>
                  <p>Para mais informações, consulte nossa política completa de trocas e devoluções.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
