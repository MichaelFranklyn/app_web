"use client";

import { Alert } from "@/components/Alert";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Dropdown } from "@/components/Dropdown";
import { EmptyState } from "@/components/EmptyState";
import { FormBuilder } from "@/components/FormBuilder";
import { ImportLogCard } from "@/components/ImportLogCard";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { PanelHeader } from "@/components/PanelHeader";
import { Progress } from "@/components/Progress";
import { ScoreCard } from "@/components/ScoreCard";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { Tooltip } from "@/components/Tooltip";
import {
  Edit,
  ExternalLink,
  InfoIcon,
  MoreHorizontal,
  PackageSearch,
  Plus,
  RefreshCw,
  Trash,
} from "lucide-react";

const Page = () => {
  const { toast } = useToast();

  return (
    <div className="flex min-h-screen w-screen flex-col gap-16 p-16 pb-40">
      {/* ── Avatar ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Avatar</Title>
        <div className="flex items-center gap-4">
          <Avatar size="sm" color="amber">
            CS
          </Avatar>
          <Avatar size="md" color="blue">
            FM
          </Avatar>
          <Avatar size="lg" color="green">
            RA
          </Avatar>
          <Avatar size="lg" color="purple">
            PR
          </Avatar>
          <Avatar size="md" src="https://github.com/shadcn.png" alt="Shadcn" />
          <Avatar size="md" initials="AB" color="amber" />
        </div>
      </div>

      {/* ── Badge ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Badge</Title>
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="green" appearance="tinted">
            Ativo
          </Badge>
          <Badge color="red" appearance="tinted">
            <Badge.Dot />
            <Badge.Text>Urgente</Badge.Text>
          </Badge>
          <Badge color="amber" appearance="tinted">
            <Badge.Dot />
            <Badge.Text>Atenção</Badge.Text>
          </Badge>
          <Badge color="blue" appearance="solid">
            <Badge.Text>Info</Badge.Text>
          </Badge>
          <Badge color="neutral" appearance="outline">
            <Badge.Text>Neutro</Badge.Text>
          </Badge>
          <Badge color="red" appearance="tinted">
            <Badge.Icon>
              <InfoIcon />
            </Badge.Icon>
            <Badge.Text>Estoque Baixo</Badge.Text>
          </Badge>
        </div>
      </div>

      {/* ── Button ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Button</Title>
        <div className="flex flex-wrap items-center gap-3">
          <Button.Root appearance="solid" color="amber" size="md">
            <Button.Title>Solid</Button.Title>
          </Button.Root>
          <Button.Root appearance="outline" color="amber" size="md">
            <Button.Title>Outline</Button.Title>
          </Button.Root>
          <Button.Root appearance="tinted" color="amber" size="md">
            <Button.Title>Tinted</Button.Title>
          </Button.Root>
          <Button.Root appearance="solid" color="red" size="md">
            <Button.Icon icon={Trash} />
            <Button.Title>Excluir</Button.Title>
          </Button.Root>
          <Button.Root appearance="outline" color="red" size="md" isIconOnly>
            <Button.Icon icon={Trash} />
          </Button.Root>
          <Button.Root appearance="solid" color="amber" size="sm" loading>
            <Button.Title>Carregando</Button.Title>
          </Button.Root>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Breadcrumb</Title>
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>Settings</Breadcrumb.Item>
        </Breadcrumb.Root>
      </div>

      {/* ── Alert ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Alert</Title>
        <Alert.Root variant="info">
          <Alert.Icon icon={InfoIcon} />
          <Alert.Content>
            <Alert.Title>Informação</Alert.Title>
            <Alert.Description>
              Nova funcionalidade disponível no sistema.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        <Alert.Root variant="success">
          <Alert.Icon icon={InfoIcon} />
          <Alert.Content>
            <Alert.Title>Sucesso</Alert.Title>
            <Alert.Description>Dados salvos com sucesso.</Alert.Description>
          </Alert.Content>
        </Alert.Root>

        <Alert.Root variant="warning">
          <Alert.Icon icon={InfoIcon} />
          <Alert.Content>
            <Alert.Title>Atenção</Alert.Title>
            <Alert.Description>
              Sua assinatura vence em 3 dias.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        <Alert.Root variant="error">
          <Alert.Icon icon={InfoIcon} />
          <Alert.Content>
            <Alert.Title>Erro</Alert.Title>
            <Alert.Description>
              Falha ao conectar com o servidor.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        <Alert.Root variant="neutral">
          <Alert.Icon icon={InfoIcon} />
          <Alert.Content>
            <Alert.Title>Neutro</Alert.Title>
            <Alert.Description>
              Nenhuma ação necessária no momento.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </div>

      {/* ── Card ── */}
      <div className="flex flex-col gap-8">
        <Title variant="heading-lg">Card System</Title>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Standard Card */}
          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Standard</Title>
            <Card.Root accent="blue">
              <Card.Header>
                <Card.Header.Title>Usuários Ativos</Card.Header.Title>
                <Card.Header.Actions>
                  <Button.Root
                    size="xs"
                    color="amber"
                    appearance="solid"
                    isIconOnly
                  >
                    <Button.Icon icon={RefreshCw} />
                  </Button.Root>
                </Card.Header.Actions>
              </Card.Header>
              <Card.Body>
                <Title variant="body" color="secondary">
                  Conteúdo principal do card com borda de destaque azul.
                </Title>
              </Card.Body>
              <Card.Footer>
                <span>Atualizado há 2 min</span>
                <span className="cursor-pointer font-medium text-(--amber)">
                  Ver todos
                </span>
              </Card.Footer>
            </Card.Root>
          </div>

          {/* KPI Card */}
          <div className="flex flex-col gap-4">
            <Title variant="heading-md">KPI</Title>
            <div className="grid grid-cols-1 gap-4">
              <Card.Kpi>
                <Card.Kpi.Label>Faturamento Total</Card.Kpi.Label>
                <Card.Kpi.Value status="ok">R$ 124.500,00</Card.Kpi.Value>
                <Card.Kpi.Delta positive>↑ 12% vs mês anterior</Card.Kpi.Delta>
              </Card.Kpi>

              <Card.Kpi>
                <Card.Kpi.Label>Pedidos Pendentes</Card.Kpi.Label>
                <Card.Kpi.Value status="urgente">47</Card.Kpi.Value>
                <Card.Kpi.Delta negative>↓ 5 desde ontem</Card.Kpi.Delta>
              </Card.Kpi>
            </div>
          </div>

          {/* Accent Card */}
          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Accent</Title>
            <Card.Accent color="red">
              <Card.Accent.Label color="red">Estoque Zerado</Card.Accent.Label>
              <Card.Accent.Title>Cimento CP-II 50kg</Card.Accent.Title>
              <Card.Accent.Description>
                Zerado há 8 dias · Construmix Ltda
              </Card.Accent.Description>
            </Card.Accent>

            <Card.Accent color="amber">
              <Card.Accent.Label color="amber">
                Tabela Vencendo
              </Card.Accent.Label>
              <Card.Accent.Title>Tabela de Preços Sul</Card.Accent.Title>
              <Card.Accent.Description>
                Vence em 48 horas
              </Card.Accent.Description>
            </Card.Accent>
          </div>

          {/* Panel Card */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Title variant="heading-md">Panel (Complex Compound)</Title>
            <Card.Root>
              <Card.Header>
                <Card.Header.Eyebrow>Clientes em Alerta</Card.Header.Eyebrow>
                <Card.Header.Actions>
                  <Button.Root
                    size="xs"
                    color="amber"
                    appearance="solid"
                    isIconOnly
                  >
                    <Button.Icon icon={RefreshCw} />
                  </Button.Root>
                </Card.Header.Actions>
              </Card.Header>

              <Card.Body padding="compact">
                <Card.Item>
                  <Card.Item.Avatar color="amber">CS</Card.Item.Avatar>
                  <Card.Item.Info>
                    <Card.Item.Info.Name>Construmix Ltda</Card.Item.Info.Name>
                    <Card.Item.Info.Sub>
                      Estoque zerado há 8 dias
                    </Card.Item.Info.Sub>
                  </Card.Item.Info>
                  <Card.Item.Action>
                    <Badge color="red" appearance="tinted">
                      Urgente
                    </Badge>
                  </Card.Item.Action>
                </Card.Item>

                <Card.Item>
                  <Card.Item.Avatar color="blue">RA</Card.Item.Avatar>
                  <Card.Item.Info>
                    <Card.Item.Info.Name>Rei do Aço</Card.Item.Info.Name>
                    <Card.Item.Info.Sub>
                      Pedido atrasado por logística
                    </Card.Item.Info.Sub>
                  </Card.Item.Info>
                  <Card.Item.Action>
                    <Badge color="amber" appearance="tinted">
                      Atenção
                    </Badge>
                  </Card.Item.Action>
                </Card.Item>
              </Card.Body>

              <Card.Footer>
                <span>Exibindo 2 de 47 registros</span>
                <Button.Root size="xs" appearance="solid" color="amber">
                  <Button.Title>Ver Relatório Completo</Button.Title>
                </Button.Root>
              </Card.Footer>
            </Card.Root>
          </div>
        </div>
      </div>

      {/* ── Dropdown ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Dropdown System</Title>
        <div className="flex gap-4">
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Button.Root appearance="outline" color="amber" size="sm">
                <Button.Title>Ações do Vendedor</Button.Title>
                <Button.Icon icon={MoreHorizontal} />
              </Button.Root>
            </Dropdown.Trigger>
            <Dropdown.Content align="start">
              <Dropdown.Item icon={Edit}>Editar vendedor</Dropdown.Item>
              <Dropdown.Item icon={Plus}>Novo acesso a fábrica</Dropdown.Item>
              <Dropdown.Item icon={ExternalLink}>Ver carteira</Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item danger icon={Trash}>
                Remover vendedor
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </div>
      </div>

      {/* ── Empty State ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Empty State</Title>
        <EmptyState.Root>
          <EmptyState.Icon>
            <PackageSearch />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum pedido encontrado</EmptyState.Title>
          <EmptyState.Description>
            Não encontramos nenhum registro para o filtro selecionado. Tente
            mudar os termos da busca.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button.Root color="amber" size="sm" appearance="solid">
              <Button.Title>Limpar Filtros</Button.Title>
            </Button.Root>
          </EmptyState.Actions>
        </EmptyState.Root>
      </div>

      {/* ── Loading ── */}
      <div className="flex flex-col gap-8">
        <Title variant="heading-lg">Loading</Title>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Spinners</Title>
            <div className="flex items-center gap-6">
              <Loading.Spinner size="sm" />
              <Loading.Spinner size="md" colorClass="amber" />
              <Loading.Spinner size="lg" colorClass="blue" />
              <Loading.Spinner size="md" colorClass="red" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Skeletons</Title>
            <div className="flex w-64 flex-col gap-3">
              <Loading.Skeleton className="h-4 w-3/4" />
              <Loading.Skeleton className="h-3 w-1/2" />
              <Loading.Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Pagination</Title>
        <Pagination.Root>
          <Pagination.First />
          <Pagination.Prev />
          <Pagination.Item>1</Pagination.Item>
          <Pagination.Item active>2</Pagination.Item>
          <Pagination.Item>3</Pagination.Item>
          <Pagination.Ellipsis />
          <Pagination.Item>12</Pagination.Item>
          <Pagination.Next />
          <Pagination.Last />
        </Pagination.Root>
      </div>

      {/* ── Panel Header ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Panel Header</Title>
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Eyebrow>
                Módulo 07 — Gestão de Rotas
              </PanelHeader.Eyebrow>
              <PanelHeader.Title>Planejamento de Visitas</PanelHeader.Title>
              <PanelHeader.Description>
                Semana 27 · 38 visitas planejadas · Vendedor: Carlos Silva
              </PanelHeader.Description>
            </PanelHeader.Left>
            <PanelHeader.Actions>
              <Button.Root appearance="solid" size="sm">
                <Button.Title>Exportar PDF</Button.Title>
              </Button.Root>
              <Button.Root color="amber" size="sm">
                <Button.Title>Regerar Rota</Button.Title>
              </Button.Root>
            </PanelHeader.Actions>
          </PanelHeader.Top>
          <PanelHeader.Tags>
            <Badge color="green" appearance="tinted">
              Rota Confirmada
            </Badge>
            <Badge color="blue" appearance="tinted">
              Semana Atual
            </Badge>
            <Badge color="neutral" appearance="outline">
              5 dias restantes
            </Badge>
          </PanelHeader.Tags>
        </PanelHeader.Root>
      </div>

      {/* ── Import Log Card ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Import Log Card</Title>
        <div className="max-w-md">
          <ImportLogCard.Root>
            <ImportLogCard.Head>
              <ImportLogCard.Head.Group>
                <ImportLogCard.Head.File type="PNG" color="amber" />
                <ImportLogCard.Head.Info>
                  <ImportLogCard.Head.Info.Name>
                    pedido_cimento_norte_jun.pdf
                  </ImportLogCard.Head.Info.Name>
                  <ImportLogCard.Head.Info.Meta>
                    Enviado por Carlos Silva · há 4 min
                  </ImportLogCard.Head.Info.Meta>
                </ImportLogCard.Head.Info>
              </ImportLogCard.Head.Group>
              <ImportLogCard.Head.Status>
                <Badge color="amber" appearance="tinted">
                  Revisão Pendente
                </Badge>
              </ImportLogCard.Head.Status>
            </ImportLogCard.Head>

            <ImportLogCard.Body>
              <ImportLogCard.Confidence value={84} color="amber" />
              <ImportLogCard.Stats>
                <ImportLogCard.Stat value={12} label="itens extraídos" />
                <ImportLogCard.Stat
                  value={3}
                  label="precisam revisão"
                  color="red"
                />
              </ImportLogCard.Stats>
            </ImportLogCard.Body>

            <ImportLogCard.Footer>
              <ImportLogCard.Footer.Info>
                Template: ai_extraction_v3
              </ImportLogCard.Footer.Info>
              <ImportLogCard.Footer.Actions>
                <Button.Root size="xs" appearance="outline" color="amber">
                  <Button.Title>Ver Dados</Button.Title>
                </Button.Root>
                <Button.Root size="xs" color="amber">
                  <Button.Title>Revisar Itens →</Button.Title>
                </Button.Root>
              </ImportLogCard.Footer.Actions>
            </ImportLogCard.Footer>
          </ImportLogCard.Root>
        </div>
      </div>

      {/* ── Scores ── */}
      <div className="flex flex-col gap-8">
        <Title variant="heading-lg">Score System</Title>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Score Card (Multidimensional)</Title>
            <ScoreCard title="Score Global do Cliente" score={94.7} color="red">
              <ScoreCard.Dimension
                label="Urgência de Estoque"
                value={100}
                color="red"
              />
              <ScoreCard.Dimension
                label="Prioridade Manual"
                value={50}
                color="amber"
              />
              <ScoreCard.Dimension
                label="Recência de Compra"
                value={20}
                color="blue"
              />
            </ScoreCard>
          </div>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="flex flex-col gap-8">
        <Title variant="heading-lg">Progress System</Title>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Compound</Title>
            <Progress.Root>
              <Progress.Header>
                <Progress.Label>Urgência de Estoque</Progress.Label>
                <Progress.Value color="red">100</Progress.Value>
              </Progress.Header>
              <Progress.Bar value={100} color="red" />
            </Progress.Root>

            <Progress.Root>
              <Progress.Header>
                <Progress.Label>Progresso da Tarefa</Progress.Label>
                <Progress.Value>42%</Progress.Value>
              </Progress.Header>
              <Progress.Bar value={42} color="blue" />
            </Progress.Root>
          </div>
        </div>
      </div>

      {/* ── Toast & Tooltip ── */}
      <div className="flex flex-col gap-8">
        <Title variant="heading-lg">Feedback & Overlay</Title>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Toast</Title>
            <div className="flex gap-2">
              <Button.Root
                size="sm"
                color="amber"
                onClick={() =>
                  toast({
                    title: "Sucesso!",
                    description: "Operação realizada com sucesso.",
                    variant: "success",
                  })
                }
              >
                <Button.Title>Trigger Success</Button.Title>
              </Button.Root>
              <Button.Root
                size="sm"
                color="red"
                onClick={() =>
                  toast({
                    title: "Erro de Conexão",
                    description: "Falha ao salvar dados.",
                    variant: "error",
                  })
                }
              >
                <Button.Title>Trigger Error</Button.Title>
              </Button.Root>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Title variant="heading-md">Tooltip</Title>
            <div className="flex gap-6">
              <Tooltip content="Informação adicional aqui">
                <div className="cursor-help rounded border border-(--border) p-2 text-[12px]">
                  Hover me (Top)
                </div>
              </Tooltip>

              <Tooltip content="Posicionado à direita" position="right">
                <Button.Root appearance="outline" size="xs" isIconOnly>
                  <Button.Icon icon={InfoIcon} />
                </Button.Root>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Stat Row</Title>
        <div className="max-w-md">
          <Card.Root>
            <Card.Header>
              <Card.Header.Title size="sm" weight="semibold">
                Construmix Ltda — Insights
              </Card.Header.Title>
            </Card.Header>
            <Card.Body padding="compact">
              <Card.Item
                variant="stat"
                label="Último pedido"
                value="há 28 dias"
              />
              <Card.Item
                variant="stat"
                label="Intervalo médio"
                value="21 dias"
              />
              <Card.Item
                variant="stat"
                label="Estoque estimado"
                value="Zerado há 7 dias"
                color="red"
              />
              <Card.Item
                variant="stat"
                label="Churn Risk"
                value="Médio"
                color="amber"
              />
              <Card.Item
                variant="stat"
                label="Ticket médio"
                value="R$ 4.280"
                color="green"
              />
            </Card.Body>
          </Card.Root>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Tabs System</Title>
        <Tabs.Root defaultValue="geral">
          <Tabs.List>
            <Tabs.Item value="geral">Geral</Tabs.Item>
            <Tabs.Item value="pedidos">Pedidos</Tabs.Item>
            <Tabs.Item value="financeiro">Financeiro</Tabs.Item>
          </Tabs.List>
          <Tabs.Content value="geral">
            <Title variant="body" color="secondary">
              Conteúdo da aba Geral...
            </Title>
          </Tabs.Content>
          <Tabs.Content value="pedidos">
            <Title variant="body" color="secondary">
              Lista de pedidos do cliente...
            </Title>
          </Tabs.Content>
          <Tabs.Content value="financeiro">
            <Title variant="body" color="secondary">
              Resumo financeiro e débitos...
            </Title>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* ── Table ── */}
      <div className="flex flex-col gap-4">
        <Title variant="heading-lg">Table System</Title>
        <Table.Root>
          <Table.CardHead>
            <Table.CardHead.Title>Últimas Entregas</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <Button.Root size="xs" appearance="solid" color="amber">
                <Button.Title>Exportar CSV</Button.Title>
              </Button.Root>
            </Table.CardHead.Actions>
          </Table.CardHead>

          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Cód. Pedido</Table.Head>
                <Table.Head>Cliente</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Data</Table.Head>
                <Table.Head>Performance</Table.Head>
                <Table.Head className="text-right">Valor</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell variant="mono">#98342</Table.Cell>
                <Table.Cell variant="strong">Construmix Ltda</Table.Cell>
                <Table.Cell>
                  <Badge color="green" appearance="tinted">
                    Entregue
                  </Badge>
                </Table.Cell>
                <Table.Cell>12/07/2025</Table.Cell>
                <Table.ScoreCell score={95} />
                <Table.Cell variant="strong" className="text-right">
                  R$ 12.450,00
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell variant="mono">#98340</Table.Cell>
                <Table.Cell variant="strong">Rei do Aço</Table.Cell>
                <Table.Cell>
                  <Badge color="amber" appearance="tinted">
                    Em Trânsito
                  </Badge>
                </Table.Cell>
                <Table.Cell>11/07/2025</Table.Cell>
                <Table.ScoreCell score={45} />
                <Table.Cell variant="strong" className="text-right">
                  R$ 4.280,00
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Table>

          <Table.Footer>
            <Table.Footer.Info>Exibindo 2 de 12 registros</Table.Footer.Info>
            <Pagination.Root>
              <Pagination.Prev />
              <Pagination.Item active>1</Pagination.Item>
              <Pagination.Item>2</Pagination.Item>
              <Pagination.Next />
            </Pagination.Root>
          </Table.Footer>
        </Table.Root>
      </div>
      {/* ── Form Builder ── */}
      <div className="flex flex-col gap-8">
        <Title variant="heading-lg">Form Builder System (Schema Driven)</Title>

        <FormBuilder
          onSubmit={(data) => {
            console.log("Form Data:", data);
            toast({
              title: "Formulário Enviado",
              description: "Os dados foram processados com sucesso.",
              variant: "success",
            });
          }}
          steps={[
            {
              id: "step-1",
              title: "Informações Básicas",
              description: "Dados principais da nova fábrica",
              sections: [
                {
                  id: "sec-1",
                  title: "Identificação",
                  fields: [
                    {
                      name: "razao_social",
                      type: "text",
                      label: "Razão Social",
                      required: true,
                      grid: { desktop: 6 },
                    },
                    {
                      name: "nome_fantasia",
                      type: "text",
                      label: "Nome Fantasia",
                      grid: { desktop: 6 },
                    },
                    {
                      name: "tipo_loja",
                      type: "select-single",
                      label: "Tipo de Unidade",
                      required: true,
                      grid: { desktop: 4 },
                      options: [
                        { label: "Matriz", value: "matriz" },
                        { label: "Filial", value: "filial" },
                        { label: "Depósito", value: "deposito" },
                      ],
                    },
                    {
                      name: "contato_email",
                      type: "email",
                      label: "E-mail de Contato",
                      grid: { desktop: 8 },
                    },
                  ],
                },
              ],
            },
            {
              id: "step-2",
              title: "Contatos Internos",
              description: "Gerencie os responsáveis por esta unidade",
              sections: [
                {
                  id: "sec-repeater",
                  title: "Gerentes",
                  isRepeatable: true,
                  name: "managers",
                  fields: [
                    {
                      name: "name",
                      type: "text",
                      label: "Nome Completo",
                      required: true,
                      grid: { desktop: 6 },
                    },
                    {
                      name: "role",
                      type: "text",
                      label: "Cargo",
                      grid: { desktop: 6 },
                    },
                  ],
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Page;
