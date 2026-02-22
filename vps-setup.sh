#!/bin/bash

# VPS Setup Script for MotoTracker + Traefik + Supabase (Ubuntu 24.04 focus)

# 0. Install Docker if missing
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# 1. Create shared network
docker network create proxy-net || true

# 2. Setup Traefik directory and acme.json
mkdir -p traefik
touch traefik/acme.json
chmod 600 traefik/acme.json

# 3. Setup Supabase
if [ ! -d "supabase" ]; then
    echo "Cloning Supabase Docker..."
    # Using the correct self-hosting repo structure
    git clone --depth 1 https://github.com/supabase/supabase.git
    cd supabase/docker
    cp .env.example .env
    cd ../..
else
    echo "Supabase directory already exists."
fi

# 4. Create .env for MotoTracker if it doesn't exist
if [ ! -f ".env.vps" ]; then
    cat <<EOT >> .env.vps
DOMAIN_NAME=moto.seudominio.com
SSL_EMAIL=seu@email.com
VITE_SUPABASE_URL=https://supabase.seudominio.com
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
EOT
    echo ".env.vps criado! Edite-o com seu domínio e chaves."
fi

echo "=========================================="
echo "SETUP COMPLETO! PRÓXIMOS PASSOS (COLE E RODE):"
echo "=========================================="
echo "1. Edite as chaves do MotoTracker: nano .env.vps"
echo "2. Edite as chaves do Supabase: nano supabase/docker/.env"
echo "3. Suba o Traefik: docker compose -f docker-compose.traefik.yml up -d"
echo "4. Suba o Supabase: cd supabase/docker && docker compose up -d && cd ../.."
echo "5. Suba o MotoTracker: docker compose up -d --build"
echo "=========================================="
