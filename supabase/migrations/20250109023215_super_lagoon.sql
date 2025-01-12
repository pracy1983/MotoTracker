/*
  # Schema inicial do MotoTracker

  1. Novas Tabelas
    - `motocicletas`
      - Dados básicos da moto do usuário
      - Vinculada ao usuário através do auth.uid()
    - `manutencoes`
      - Registro de manutenções realizadas
      - Vinculada à moto e ao usuário
    - `oficinas`
      - Cadastro de oficinas parceiras
      - Dados de contato e localização

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas no usuário autenticado
*/

-- Tabela de motocicletas
CREATE TABLE IF NOT EXISTS motocicletas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  marca text NOT NULL,
  modelo text NOT NULL,
  ano integer NOT NULL,
  quilometragem_atual integer NOT NULL DEFAULT 0,
  ultima_troca_oleo timestamp with time zone,
  ultima_troca_pneus timestamp with time zone,
  ultima_revisao_freios timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de manutenções
CREATE TABLE IF NOT EXISTS manutencoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motocicleta_id uuid REFERENCES motocicletas(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  tipo text NOT NULL,
  data timestamp with time zone NOT NULL DEFAULT now(),
  quilometragem integer NOT NULL,
  custo decimal(10,2) NOT NULL DEFAULT 0,
  local text,
  observacoes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela de oficinas
CREATE TABLE IF NOT EXISTS oficinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  endereco text NOT NULL,
  telefone text,
  avaliacao decimal(2,1) CHECK (avaliacao >= 0 AND avaliacao <= 5),
  latitude decimal(10,8),
  longitude decimal(11,8),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE motocicletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para motocicletas
CREATE POLICY "Usuários podem ver suas próprias motos"
  ON motocicletas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias motos"
  ON motocicletas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias motos"
  ON motocicletas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas de segurança para manutenções
CREATE POLICY "Usuários podem ver suas próprias manutenções"
  ON manutencoes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem registrar manutenções"
  ON manutencoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para oficinas
CREATE POLICY "Todos podem ver oficinas"
  ON oficinas
  FOR SELECT
  TO authenticated
  USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_motocicletas_updated_at
  BEFORE UPDATE ON motocicletas
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_oficinas_updated_at
  BEFORE UPDATE ON oficinas
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();