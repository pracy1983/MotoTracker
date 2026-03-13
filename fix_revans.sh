#!/bin/bash
# ============================================================
# MotoTracker - Script de Correção Completa
# ============================================================

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERRO]${NC} $1"; }

echo "============================================================"
echo " MotoTracker - Correção de Infraestrutura"
echo "============================================================"

# ─── 1. LOCALIZAR O DOCKER COMPOSE DA STACK ──────────────────
echo ""
echo ">>> PASSO 1: Localizando a stack do Supabase..."

STACK_DIR=$(find /etc/easypanel /root /home -name "docker-compose.yml" 2>/dev/null \
  | xargs grep -l "gotrue\|supabase-auth" 2>/dev/null | head -1 | xargs dirname)

if [ -z "$STACK_DIR" ]; then
  err "Não encontrei o docker-compose.yml automaticamente."
  STACK_DIR="/etc/easypanel/projects/mototracker"
fi

log "Stack encontrada em: $STACK_DIR"
cd "$STACK_DIR"

# ─── 2. BACKUP ────────────────────────────────────────────────
echo ""
echo ">>> PASSO 2: Fazendo backup do compose atual..."
cp docker-compose.yml "docker-compose.yml.bak.$(date +%s)"
log "Backup criado."

# ─── 3. PARAR TUDO LIMPO ──────────────────────────────────────
echo ""
echo ">>> PASSO 3: Parando containers da stack..."
docker compose down --remove-orphans 2>/dev/null || docker-compose down --remove-orphans 2>/dev/null || true
log "Containers parados."

# ─── 4. APLICAR PATCH NO DOCKER-COMPOSE.YML ──────────────────
echo ""
echo ">>> PASSO 4: Aplicando patches no docker-compose.yml (Vector & Auth)..."

python3 - << 'PYEOF'
import yaml, sys

with open("docker-compose.yml", "r") as f:
    compose = yaml.safe_load(f)

services = compose.get("services", {})
changed = False

# Remove vector e dependências
for svc_name in list(services.keys()):
    svc = services[svc_name]

    if "vector" in svc_name.lower():
        print(f"  [REMOVENDO] Serviço: {svc_name}")
        del services[svc_name]
        changed = True
        continue

    if "depends_on" in svc:
        deps = svc["depends_on"]
        if isinstance(deps, dict):
            keys = list(deps.keys())
            for k in keys:
                if "vector" in k.lower():
                    del deps[k]
                    changed = True
        elif isinstance(deps, list):
            new_deps = [d for d in deps if "vector" not in d.lower()]
            if len(new_deps) != len(deps):
                svc["depends_on"] = new_deps
                changed = True

    # Injeta variáveis booleanas no auth
    if any(x in svc_name.lower() for x in ["auth", "gotrue"]):
        env = svc.get("environment", {})
        bool_vars = {
            "GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED": "false",
            "ENABLE_ANONYMOUS_USERS": "false",
            "ENABLE_EMAIL_SIGNUP": "true",
            "ENABLE_EMAIL_AUTOCONFIRM": "false",
            "GOTRUE_MAILER_AUTOCONFIRM": "false",
            "GOTRUE_DISABLE_SIGNUP": "false",
            "GOTRUE_EXTERNAL_EMAIL_ENABLED": "true",
            "GOTRUE_EXTERNAL_PHONE_ENABLED": "false",
            "GOTRUE_SMS_AUTOCONFIRM": "false",
            "GOTRUE_SECURITY_CAPTCHA_ENABLED": "false",
            "GOTRUE_LOG_LEVEL": "info",
        }

        if isinstance(env, dict):
            for k, v in bool_vars.items():
                if k not in env or not env[k] or env[k] == "":
                    print(f"  [CORRIGINDO] {k}={v} em {svc_name}")
                    env[k] = v
                    changed = True
        elif isinstance(env, list):
            keys = {x.split('=')[0] for x in env if '=' in x}
            for k, v in bool_vars.items():
                if k not in keys:
                    print(f"  [ADICIONANDO] {k}={v} em {svc_name}")
                    env.append(f"{k}={v}")
                    changed = True

if changed:
    with open("docker-compose.yml", "w") as f:
        yaml.dump(compose, f, default_flow_style=False)
    print("\n[OK] docker-compose.yml atualizado.")
else:
    print("\n[INFO] Nenhuma alteração necessária.")
PYEOF

# ─── 5. RESETAR REDES ─────────────────────────────────────────
echo ""
echo ">>> PASSO 5: Limpando redes Docker..."
docker network ls --format "{{.Name}}" | grep -i "mototracker\|supabase" | while read net; do
    docker network rm "$net" 2>/dev/null || true
done
log "Redes limpas."

# ─── 6. REINICIAR ─────────────────────────────────────────────
echo ""
echo ">>> PASSO 6: Subindo a stack..."
docker compose up -d
log "Stack iniciada."

echo ""
echo "Aguardando 10s para verificação..."
sleep 10
docker compose ps
