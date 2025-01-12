# Instruções para Fork e Backup do Projeto MotoTracker

## 1. Como fazer um Fork no StackBlitz

1. No canto superior direito da tela, clique no botão "Fork"
2. O StackBlitz criará automaticamente uma cópia completa do projeto
3. Esta cópia terá uma nova URL única
4. Você pode começar a fazer alterações nesta nova cópia sem afetar o projeto original

## 2. Como fazer Backup do Projeto

### Opção 1: Download Completo
1. No menu superior, clique nos três pontos (...)
2. Selecione "Download"
3. Um arquivo .zip será baixado com todo o código do projeto

### Opção 3: Copiar Arquivos Importantes
Se você preferir copiar manualmente os arquivos mais importantes, aqui está a estrutura:

```
projeto/
├── src/
│   ├── components/
│   │   ├── Auth.tsx
│   │   ├── CadastroMoto.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Header.tsx
│   │   ├── HistoricoManutencao.tsx
│   │   ├── ManutencoesProgramadas.tsx
│   │   ├── MapaRota.tsx
│   │   ├── NovaManutencao.tsx
│   │   ├── Notifications.tsx
│   │   ├── Odometer.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/
│       ├── 20250109023215_super_lagoon.sql
│       ├── 20250109024803_foggy_ember.sql
│       └── 20250109194539_spring_dream.sql
├── package.json
└── .env
```

## 3. Restaurando o Projeto

### Para restaurar um backup:
1. Crie um novo projeto no StackBlitz
2. Importe o arquivo .zip baixado ou
3. Copie e cole os arquivos manualmente na estrutura correta

### Configurações necessárias após restauração:
1. Conecte ao Supabase usando o botão "Connect to Supabase"
2. Aguarde a instalação das dependências
3. O projeto estará pronto para uso

## Observações Importantes

- Mantenha os arquivos .env seguros e não os compartilhe
- As migrations do Supabase são essenciais para a estrutura do banco de dados
- Certifique-se de ter todas as dependências listadas no package.json