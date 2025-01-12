# MotoTracker

Sistema de rastreamento e gerenciamento de motocicletas desenvolvido com React, TypeScript e Supabase.

## 🚀 Requisitos do Ambiente

- Node.js 18+ (LTS recomendado)
- npm ou yarn
- Git

## 💻 Tecnologias Utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Leaflet (para mapas)
- Supabase (backend e banco de dados)

## 🛠️ Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/pracy1983/MotoTracker.git
cd MotoTracker
```

2. Instale as dependências:
```bash
npm install
# ou
yarn
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis do Supabase com suas credenciais

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## 📦 Build para Produção

Para gerar a versão de produção:

```bash
npm run build
# ou
yarn build
```

## 🌐 Deploy

Este projeto está configurado para deploy no Netlify. Para fazer o deploy:

1. Faça fork deste repositório
2. Acesse [app.netlify.com](https://app.netlify.com)
3. Clique em "Add new site" > "Import an existing project"
4. Conecte com o GitHub e selecione este repositório
5. Configure as variáveis de ambiente no Netlify:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

## 📝 Licença

Este projeto está sob a licença MIT.
