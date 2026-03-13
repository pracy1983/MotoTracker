-- Add Cascade to Manutencoes
-- First we need to find the constraint name. Usually it's manutencoes_motocicleta_id_fkey
ALTER TABLE manutencoes 
DROP CONSTRAINT IF EXISTS manutencoes_motocicleta_id_fkey,
ADD CONSTRAINT manutencoes_motocicleta_id_fkey 
FOREIGN KEY (motocicleta_id) 
REFERENCES motocicletas(id) 
ON DELETE CASCADE;

-- Add Cascade to Rotas
ALTER TABLE rotas 
DROP CONSTRAINT IF EXISTS rotas_motocicleta_id_fkey,
ADD CONSTRAINT rotas_motocicleta_id_fkey 
FOREIGN KEY (motocicleta_id) 
REFERENCES motocicletas(id) 
ON DELETE CASCADE;

-- Add DELETE policies that were missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'motocicletas' AND policyname = 'Usuários podem deletar suas próprias motos'
    ) THEN
        CREATE POLICY "Usuários podem deletar suas próprias motos"
          ON motocicletas
          FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'manutencoes' AND policyname = 'Usuários podem deletar suas próprias manutenções'
    ) THEN
        CREATE POLICY "Usuários podem deletar suas próprias manutenções"
          ON manutencoes
          FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rotas' AND policyname = 'Usuários podem deletar suas próprias rotas'
    ) THEN
        CREATE POLICY "Usuários podem deletar suas próprias rotas"
          ON rotas
          FOR DELETE
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM motocicletas
              WHERE motocicletas.id = rotas.motocicleta_id
              AND motocicletas.user_id = auth.uid()
            )
          );
    END IF;
END $$;
