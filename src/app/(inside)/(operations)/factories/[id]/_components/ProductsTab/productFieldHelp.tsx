/** Explicações dos campos de produto, compartilhadas pelos modais de criar e editar. */
export const PRODUCT_FIELD_HELP = {
  sku: "É o código do produto na fábrica. Você encontra na planilha de preços ou no catálogo da fábrica.",
  name: "Nome que aparece nas listas e nos pedidos. Use o nome que o cliente conhece.",
  category:
    "Grupo do produto, como Hidráulica ou Ferramentas. Serve para organizar e encontrar mais fácil.",
  unit: "Como o produto é medido: unidade (peça), quilo, metro, litro… Se não estiver na lista, digite o nome para criar.",
  unitLabel:
    "Como a fábrica embala para vender: caixa, fardo, pacote, rolo… Se não estiver na lista, digite o nome para criar.",
  unitPerPack:
    "Quantas peças vêm dentro da embalagem fechada. Exemplo: caixa com 12 peças, digite 12. Se vende avulso, digite 1.",
  ncm: "Código fiscal do produto (ex: 3926.90.90). Vem na nota fiscal da fábrica e serve para calcular os impostos. Pode deixar vazio.",
  saleMultiple:
    "A fábrica só aceita pedidos em quantidades múltiplas deste número. Exemplo: 12 — pode pedir 12, 24, 36… Deixe vazio se pode pedir qualquer quantidade.",
} as const;
