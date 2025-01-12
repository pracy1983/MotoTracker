export interface Manutencao {
  id: string;
  data: string;
  tipo: string;
  quilometragem: number;
  custo: number;
  local: string;
  observacoes: string;
}

export interface Motocicleta {
  id: string;
  quilometragemAtual: number;
  ultimaTrocaOleo: string;
  ultimaTrocaPneus: string;
  ultimaRevisaoFreios: string;
}

export interface Oficina {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  avaliacao: number;
  latitude: number;
  longitude: number;
}