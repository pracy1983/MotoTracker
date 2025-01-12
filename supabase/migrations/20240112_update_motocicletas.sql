-- Adiciona novos campos na tabela motocicletas
ALTER TABLE motocicletas
ADD COLUMN IF NOT EXISTS placa VARCHAR(7),
ADD COLUMN IF NOT EXISTS cor VARCHAR(50);

-- Atualiza as políticas de segurança para incluir os novos campos
CREATE POLICY "Usuários podem inserir suas próprias motos com placa e cor" ON motocicletas
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar placa e cor de suas próprias motos" ON motocicletas
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
