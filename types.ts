
export interface Order {
  id: string;
  pedido: string;
  cliente: string;
  cidade: string;
  cluster: string;
  status: string;
  obs: string;
  supervisor: string;
  alteracaoRede: 'Sim' | 'Não';
  redeDesignada: string;
  redeConstruida: string;
  chamado: string;
  atualizadoPor: string;
  draft?: number;        // Novo Campo Numérico
  statusDraft?: string;  // Novo Campo de Status
  dataCriacao: number;
}

export interface SystemConfig {
  cidades: string[];
  clusters: string[];
  supervisores: string[];
  statusList: string[];
  atualizadores: string[];
  statusDraftList: string[]; // Nova lista configurável
}

export const DEFAULT_CONFIG: SystemConfig = {
  cidades: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'],
  clusters: ['Cluster Norte', 'Cluster Sul', 'Cluster Leste', 'Cluster Oeste'],
  supervisores: ['Ana Silva', 'Carlos Oliveira', 'Mariana Santos'],
  statusList: ['Novo', 'Em Análise', 'Aprovado', 'Em Construção', 'Concluído', 'Cancelado'],
  atualizadores: ['João Tech', 'Maria Ops', 'Pedro Field'],
  statusDraftList: ['Aberto', 'Em Andamento', 'Finalizado'], // Padrão
};
