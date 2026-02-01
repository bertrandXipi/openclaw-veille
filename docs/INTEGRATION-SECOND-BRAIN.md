# Intégration avec second-brain

Ce document explique comment `openclaw-veille` utilise le code de `second-brain` sans le modifier.

## 🔗 Relation entre les Projets

```
second-brain/                    # Repo existant (inchangé)
├── discord-ingest-bot/          # Bot Discord manuel
├── batch-processor/             # ← Code réutilisé par openclaw-veille
│   ├── src/
│   │   ├── notebooklm-http.js   # ← Importé en read-only
│   │   ├── fetch-content.js     # ← Importé en read-only
│   │   └── markdown-generator-v2.js  # ← Importé en read-only
│   └── workdir/repo/            # ← Repo Git partagé
│
openclaw-veille/                 # Nouveau repo (ce projet)
├── mcp-wrapper/                 # Wrapper MCP TypeScript
│   └── src/
│       └── tools/
│           └── archive-url.ts   # Importe le code de second-brain
├── openclaw-config/             # Config OpenClaw
└── docker-compose.yml           # Monte second-brain en read-only
```

## 📦 Code Partagé

### Modules Importés (Read-Only)

Le MCP wrapper importe ces modules de `second-brain` :

```typescript
// mcp-wrapper/src/tools/archive-url.ts
import { addToNotebookLM, getDetailedAnalysis } from '../../../second-brain/batch-processor/src/notebooklm-http.js';
import { fetchAndExtract } from '../../../second-brain/batch-processor/src/fetch-content.js';
import { generateMarkdownV2 } from '../../../second-brain/batch-processor/src/markdown-generator-v2.js';
import simpleGit from 'simple-git';
```

### Repo Git Partagé

Les deux systèmes écrivent dans le même repo Git (`fiches-veille`) :

- **Discord** : tag `ingest_source: discord`
- **OpenClaw** : tag `ingest_source: openclaw`

Pas de conflit grâce à :
- Git pull avant chaque commit
- Messages de commit différenciés
- Retry avec rebase si push échoué

## 🐳 Configuration Docker

### Sur le VPS

```bash
# Structure des dossiers
/opt/
├── second-brain/                # Clone du repo second-brain
│   ├── batch-processor/
│   └── workdir/repo/            # Repo Git fiches-veille
│
└── openclaw-veille/             # Clone du repo openclaw-veille
    ├── mcp-wrapper/
    ├── openclaw-config/
    └── docker-compose.yml
```

### Volumes Docker

```yaml
# openclaw-veille/docker-compose.yml
services:
  mcp-wrapper:
    volumes:
      # Monte second-brain en read-only
      - /opt/second-brain/batch-processor:/app/batch-processor:ro
      
      # Partage le repo Git
      - /opt/second-brain/workdir/repo:/app/workdir/repo
```

## 🔄 Workflow de Déploiement

### 1. Déployer second-brain (si modifié)

```bash
# Sur Google Cloud Run (veille-bot)
gcloud compute scp second-brain/batch-processor/src/notebooklm-http.js \
  veille-bot:/home/USER/second-brain/batch-processor/src/ \
  --zone=us-central1-a

gcloud compute ssh veille-bot --zone=us-central1-a \
  --command="sudo systemctl restart veille-bot"
```

### 2. Déployer openclaw-veille (si modifié)

```bash
# Sur le VPS Hetzner
ssh openclaw@vps-ip
cd /opt/openclaw-veille
git pull
cd mcp-wrapper && npm run build
docker-compose restart
```

### 3. Vérifier la Cohabitation

```bash
# Vérifier que Discord fonctionne toujours
# → Poster une URL dans Discord

# Vérifier qu'OpenClaw fonctionne
# → Envoyer "Archive https://..." via WhatsApp

# Vérifier le repo Git
cd /opt/second-brain/workdir/repo
git log --oneline -10
# Devrait montrer des commits de discord ET openclaw
```

## 🔐 Sécurité

### Isolation

- Le code de `second-brain` est monté en **read-only** dans Docker
- OpenClaw ne peut **pas modifier** le code existant
- Seul le repo Git est partagé en écriture

### Credentials

- Chaque projet a son propre `.env`
- Pas de partage de credentials entre projets
- Tokens GitHub identiques (même repo Git)

## 🧪 Tests

### Tester l'Import du Code

```bash
# Dans openclaw-veille/mcp-wrapper/
npm test

# Devrait importer et utiliser le code de second-brain sans erreur
```

### Tester la Cohabitation

```bash
# 1. Archiver via Discord
# → Vérifier que la fiche a tag "ingest_source: discord"

# 2. Archiver via OpenClaw
# → Vérifier que la fiche a tag "ingest_source: openclaw"

# 3. Vérifier qu'il n'y a pas de conflit Git
cd /opt/second-brain/workdir/repo
git status
# Devrait être "clean"
```

## 📊 Monitoring

### Vérifier que second-brain fonctionne

```bash
# Discord bot
gcloud compute ssh veille-bot --zone=us-central1-a \
  --command="sudo systemctl status veille-bot --no-pager"

# Logs
gcloud compute ssh veille-bot --zone=us-central1-a \
  --command="sudo journalctl -u veille-bot -n 50"
```

### Vérifier qu'openclaw-veille fonctionne

```bash
# SSH sur le VPS
ssh openclaw@vps-ip

# Status containers
docker-compose ps

# Logs
docker-compose logs -f openclaw
docker-compose logs -f mcp-wrapper
```

## 🚨 Troubleshooting

### Erreur : "Cannot find module 'second-brain/...'"

**Cause :** Le volume Docker n'est pas correctement monté.

**Solution :**
```bash
# Vérifier que second-brain existe sur le VPS
ls -la /opt/second-brain/batch-processor/src/

# Vérifier le docker-compose.yml
cat docker-compose.yml | grep batch-processor

# Redémarrer les containers
docker-compose down
docker-compose up -d
```

### Erreur : "Git push rejected"

**Cause :** Conflit Git entre Discord et OpenClaw.

**Solution :**
```bash
# Dans le container mcp-wrapper
docker-compose exec mcp-wrapper sh
cd /app/workdir/repo
git pull --rebase
git push
```

### Discord ne fonctionne plus après déploiement OpenClaw

**Cause :** Modification accidentelle du code de second-brain.

**Solution :**
```bash
# Vérifier qu'il n'y a pas de modification
cd /opt/second-brain
git status

# Si modifié, restaurer
git checkout .

# Redémarrer Discord bot
gcloud compute ssh veille-bot --zone=us-central1-a \
  --command="sudo systemctl restart veille-bot"
```

## 📚 Références

- [second-brain README](https://github.com/YOUR_USERNAME/second-brain/blob/main/README.md)
- [openclaw-veille REQUIREMENTS](./REQUIREMENTS.md)
- [openclaw-veille DESIGN](./DESIGN.md)

