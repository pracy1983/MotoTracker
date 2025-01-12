/*
  # Adiciona tabela de rotas

  1. Nova Tabela
    - `rotas`
      - `id` (uuid, primary key)
      - `motocicleta_id` (uuid, referência para motocicletas)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `timestamp` (timestamp with time zone)
      - `created_at` (timestamp with time zone)

  2. Segurança
    - Habilita RLS na tabela rotas
    - Adiciona políticas para usuários autenticados
*/

CREATE TABLE IF NOT EXISTS rotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motocicleta_id uuid REFERENCES motocicletas(id) NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE rotas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para rotas
CREATE POLICY "Usuários podem ver suas próprias rotas"
  ON rotas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM motocicletas
      WHERE motocicletas.id = rotas.motocicleta_id
      AND motocicletas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir rotas para suas motos"
  ON rotas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM motocicletas
      WHERE motocicletas.id = rotas.motocicleta_id
      AND motocicletas.user_id = auth.uid()
    )
  );