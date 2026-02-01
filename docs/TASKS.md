# Tasks : Implémentation OpenClaw Agent Autonome

Ce document liste toutes les tâches d'implémentation, organisées par phase.

**Statut :** Draft  
**Version :** 1.0  
**Date :** 2026-02-01

---

## 🔴 RÈGLE CRITIQUE : TOUT PASSE PAR GITHUB

**Aucune exception.** Chaque modification, chaque fichier, chaque configuration doit être :

1. ✅ **Développé localement** (macOS)
2. ✅ **Commité sur GitHub** (avec message descriptif)
3. ✅ **Poussé sur GitHub** (`git push origin main`)
4. ✅ **Pulé sur le VPS** (`git pull`)
5. ✅ **Déployé sur le VPS** (docker-compose, npm build, etc.)

**Workflow obligatoire :**
```bash
# Sur macOS
git add .
git commit -m "feat: description claire"
git push origin main

# Sur le VPS
git pull
docker-compose restart
```

**❌ NE JAMAIS :**
- Éditer des fichiers directement sur le VPS
- Faire des modifications sans commit
- Utiliser `git push --force`
- Laisser des fichiers non-versionés

**Pourquoi ?**
- Traçabilité complète
- Possibilité de rollback
- Collaboration facile
- Backup automatique
- Audit trail

---

## 📊 Vue d'ensemble

| Phase | Durée | Tâches | Statut |
|-------|-------|--------|--------|
| Phase 1 : MCP Wrapper | 1-2 jours | 12 tâches | ✅ **COMPLÉTÉ** (11/12) |
| Phase 2 : Test Gemini CLI | 1 jour | 6 tâches | ⏳ À faire |
| Phase 3 : VPS Setup | 1-2 jours | 8 tâches | ⏳ À faire |
| Phase 4 : Config OpenClaw | 1 jour | 7 tâches | ⏳ À faire |
| Phase 5 : Déploiement | 1 jour | 6 tâches | ⏳ À faire |
| Phase 6 : Optimisation | 3-5 jours | 8 tâches | ⏳ À faire |
| **TOTAL** | **8-12 jours** | **47 tâches** | |

---

## 🟢 Phase 1 : MCP Wrapper (Jours 1-2) ✅ COMPLÉTÉ

### 1.1 Setup Projet TypeScript ✅

- [x] **T1.1.1** : Créer `mcp-wrapper/package.json` ✅
  - Dépendances : `@modelcontextprotocol/sdk`, `zod`, `simple-git`
  - DevDependencies : `typescript`, `vitest`, `@types/node`
  - Scripts : `build`, `test`, `dev`
  - **Durée** : 15 min

- [x] **T1.1.2** : Créer `mcp-wrapper/tsconfig.json` ✅
  - Target : ES2022
  - Module : ESNext
  - ModuleResolution : node
  - OutDir : dist
  - **Durée** : 10 min

- [x] **T1.1.3** : Créer structure de dossiers ✅
  ```
  mcp-wrapper/
  ├── src/
  │   ├── index.ts
  │   ├── tools/
  │   ├── validation.ts
  │   ├── content-sanitizer.ts
  │   ├── rate-limiter.ts
  │   ├── monitoring.ts
  │   └── logger.ts
  └── test/
  ```
  - **Durée** : 5 min

### 1.2 Implémentation Validation ✅

- [x] **T1.2.1** : Implémenter `validation.ts` ✅
  - Fonction `validateUrl(url: string): boolean`
  - Whitelist de domaines (Reddit, HackerNews, YouTube, etc.)
  - Fonction `sanitizeTags(tags: string[]): string[]`
  - Fonction `sanitizeNote(note: string): string`
  - **Durée** : 1h
  - **Référence** : DESIGN.md section "Validation d'Entrée"

- [x] **T1.2.2** : Tests unitaires pour validation ✅
  - Test whitelist domaines
  - Test sanitization tags
  - Test sanitization note (détection patterns dangereux)
  - **Durée** : 1h

### 1.3 Implémentation Sanitization ✅

- [x] **T1.3.1** : Implémenter `content-sanitizer.ts` ✅
  - Fonction `sanitizeContent(content: string): string`
  - Détection patterns injection : "ignore previous instructions", etc.
  - Limite de taille : 50000 caractères
  - **Durée** : 1h
  - **Référence** : DESIGN.md section "Sanitization du Contenu"

- [x] **T1.3.2** : Tests unitaires pour sanitization ✅
  - Test détection injections
  - Test limite de taille
  - **Durée** : 30 min

### 1.4 Implémentation Rate Limiting ✅

- [x] **T1.4.1** : Implémenter `rate-limiter.ts` ✅
  - Classe `RateLimiter`
  - Limite quotidienne : 30 archives
  - Limite horaire : 10 archives
  - Intervalle minimum : 30 secondes
  - **Durée** : 1h30
  - **Référence** : DESIGN.md section "Rate Limiting"

- [x] **T1.4.2** : Tests unitaires pour rate limiter ✅
  - Test limite quotidienne
  - Test limite horaire
  - Test intervalle minimum
  - **Durée** : 1h

### 1.5 Implémentation Monitoring ✅

- [x] **T1.5.1** : Implémenter `monitoring.ts` ✅
  - Classe `Monitor`
  - Métriques : count, errors, cost
  - Alertes : >50 archives, >10 erreurs, >5 USD
  - **Durée** : 1h
  - **Référence** : DESIGN.md section "Monitoring et Alertes"

- [x] **T1.5.2** : Implémenter `logger.ts` ✅
  - Logs JSON structurés
  - Fonction `log(entry: LogEntry): void`
  - **Durée** : 30 min

### 1.6 Implémentation Tool MCP ✅

- [x] **T1.6.1** : Implémenter `tools/archive-url.ts` ✅
  - Schema Zod pour input/output
  - Fonction `archiveUrl(input: ArchiveUrlInput): Promise<ArchiveUrlOutput>`
  - Intégration validation, sanitization, rate limiting
  - Import code second-brain (notebooklm-http, fetch-content, markdown-generator)
  - **Durée** : 3h
  - **Référence** : DESIGN.md section "Implémentation du Tool"

- [x] **T1.6.2** : Implémenter `index.ts` (MCP Server) ✅
  - Initialisation serveur MCP (stdio transport)
  - Enregistrement tool `archive_url`
  - Gestion erreurs
  - **Durée** : 1h

### 1.7 Tests et Documentation ✅

- [ ] **T1.7.1** : Tests d'intégration
  - Test complet du flow : validation → fetch → NotebookLM → Git
  - Mock des services externes
  - **Durée** : 2h
  - **Note** : Reporté à Phase 2 (tests manuels avec Gemini CLI)

- [x] **T1.7.2** : Documentation `mcp-wrapper/README.md` ✅
  - Installation
  - Configuration
  - Utilisation
  - API du tool
  - **Durée** : 1h

---

## 🟠 Phase 2 : Test Gemini CLI (Jour 3)

### 2.1 Script de Test

- [ ] **T2.1.1** : Créer `scripts/test-mcp-gemini.sh`
  - Démarrer MCP server en background
  - Appeler Gemini CLI avec MCP
  - Vérifier création fiche markdown
  - Vérifier commit Git
  - **Durée** : 1h

- [ ] **T2.1.2** : Créer `scripts/test-mcp-manual.ts`
  - Test sans Gemini CLI (JSON-RPC direct)
  - Spawn MCP server
  - Envoyer requête via stdin
  - Lire réponse via stdout
  - **Durée** : 1h

### 2.2 Tests Fonctionnels

- [ ] **T2.2.1** : Tester avec HackerNews
  - URL : https://news.ycombinator.com/item?id=12345678
  - Vérifier fiche créée
  - Vérifier source NotebookLM
  - **Durée** : 30 min

- [ ] **T2.2.2** : Tester avec YouTube
  - URL : https://youtube.com/watch?v=abc123
  - Vérifier transcription
  - **Durée** : 30 min

- [ ] **T2.2.3** : Tester avec Reddit
  - URL : https://reddit.com/r/programming/comments/xyz
  - Vérifier commentaires inclus
  - **Durée** : 30 min

- [ ] **T2.2.4** : Tester validation (URL invalide)
  - URL : https://malicious.com
  - Vérifier rejet
  - **Durée** : 15 min

---

## 🔴 Phase 3 : VPS Setup (Jours 3-4)

### 3.1 Provisionnement VPS

- [ ] **T3.1.1** : Commander VPS Hetzner CPX21
  - 4 vCPU, 4GB RAM, 80GB SSD
  - Ubuntu 24.04 LTS
  - Localisation : Europe
  - **Durée** : 30 min

- [ ] **T3.1.2** : Configuration SSH
  - Générer clé SSH locale : `ssh-keygen -t ed25519`
  - Copier clé publique sur VPS
  - Désactiver login par mot de passe
  - **Durée** : 30 min
  - **Référence** : DESIGN.md section "Sécurisation SSH"

### 3.2 Sécurisation

- [ ] **T3.2.1** : Configurer Firewall UFW
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
  - **Durée** : 15 min

- [ ] **T3.2.2** : Créer utilisateur non-root
  ```bash
  sudo adduser openclaw
  sudo usermod -aG docker openclaw
  ```
  - **Durée** : 15 min

### 3.3 Installation Docker

- [ ] **T3.3.1** : Installer Docker
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```
  - **Durée** : 15 min

- [ ] **T3.3.2** : Installer Docker Compose
  ```bash
  sudo apt install docker-compose-plugin
  ```
  - **Durée** : 10 min

### 3.4 Cloner Repos

- [ ] **T3.4.1** : Cloner second-brain
  ```bash
  cd /opt
  sudo git clone https://github.com/YOUR_USERNAME/second-brain.git
  sudo chown -R openclaw:openclaw second-brain
  ```
  - **Durée** : 10 min

- [ ] **T3.4.2** : Cloner openclaw-veille
  ```bash
  cd /opt
  sudo git clone https://github.com/YOUR_USERNAME/openclaw-veille.git
  sudo chown -R openclaw:openclaw openclaw-veille
  ```
  - **Durée** : 10 min

---

## 🔵 Phase 4 : Config OpenClaw (Jours 5-6)

### 4.1 Configuration OpenClaw

- [ ] **T4.1.1** : Créer `openclaw-config/config.yaml`
  - Configuration LLM (Gemini Flash)
  - Configuration agent (max_steps: 15)
  - Déclaration MCP server
  - **Durée** : 1h
  - **Référence** : DESIGN.md section "Configuration OpenClaw"

- [ ] **T4.1.2** : Créer routines Reddit
  - `reddit-morning-hunt` (8h)
  - `reddit-afternoon-hunt` (14h)
  - `reddit-evening-hunt` (20h)
  - **Durée** : 2h

- [ ] **T4.1.3** : Créer `.env` sur le VPS
  - GEMINI_API_KEY
  - GITHUB_TOKEN
  - MY_PHONE_NUMBER
  - NOTEBOOKLM_MCP_URL
  - **Durée** : 15 min

### 4.2 Docker Compose

- [ ] **T4.2.1** : Vérifier `docker-compose.yml`
  - Services : openclaw, mcp-wrapper
  - Volumes : second-brain (ro), workdir/repo
  - Networks : brain-network
  - Security : no-new-privileges, read-only
  - **Durée** : 30 min

- [ ] **T4.2.2** : Build MCP wrapper
  ```bash
  cd /opt/openclaw-veille/mcp-wrapper
  npm install
  npm run build
  ```
  - **Durée** : 15 min

### 4.3 Premier Démarrage

- [ ] **T4.3.1** : Démarrer les containers
  ```bash
  cd /opt/openclaw-veille
  docker-compose up -d
  ```
  - **Durée** : 10 min

- [ ] **T4.3.2** : Vérifier les logs
  ```bash
  docker-compose logs -f openclaw
  docker-compose logs -f mcp-wrapper
  ```
  - **Durée** : 15 min

- [ ] **T4.3.3** : Test manuel WhatsApp
  - Envoyer "Archive https://news.ycombinator.com/item?id=123"
  - Vérifier réponse
  - Vérifier fiche créée
  - **Durée** : 30 min

---

## 🟣 Phase 5 : Déploiement (Jour 7)

### 5.1 Configuration Routines

- [ ] **T5.1.1** : Tester routine morning manuellement
  - Déclencher routine via OpenClaw CLI
  - Vérifier 10 posts archivés
  - Vérifier tags automatiques
  - **Durée** : 1h

- [ ] **T5.1.2** : Tester routine afternoon
  - **Durée** : 30 min

- [ ] **T5.1.3** : Tester routine evening
  - **Durée** : 30 min

### 5.2 Vérification Cohabitation

- [ ] **T5.2.1** : Tester Discord bot
  - Poster URL dans Discord
  - Vérifier fiche avec tag `ingest_source: discord`
  - **Durée** : 15 min

- [ ] **T5.2.2** : Tester OpenClaw
  - Archive via WhatsApp
  - Vérifier fiche avec tag `ingest_source: openclaw`
  - **Durée** : 15 min

- [ ] **T5.2.3** : Vérifier pas de conflit Git
  ```bash
  cd /opt/second-brain/workdir/repo
  git log --oneline -20
  git status
  ```
  - **Durée** : 10 min

---

## 🟡 Phase 6 : Optimisation (Jours 8-12)

### 6.1 Monitoring

- [ ] **T6.1.1** : Créer `scripts/monitor-openclaw.sh`
  - Afficher status containers
  - Afficher archives du jour
  - Afficher erreurs du jour
  - Afficher coût du jour
  - **Durée** : 1h
  - **Référence** : DESIGN.md section "Script de Monitoring"

- [ ] **T6.1.2** : Créer `scripts/backup-openclaw.sh`
  - Backup openclaw-data
  - Backup openclaw-config
  - Rétention 30 jours
  - **Durée** : 1h

- [ ] **T6.1.3** : Configurer cron backup (2h du matin)
  ```bash
  crontab -e
  0 2 * * * /opt/openclaw-veille/scripts/backup-openclaw.sh
  ```
  - **Durée** : 15 min

### 6.2 Optimisation Prompts

- [ ] **T6.2.1** : Analyser les archives de la semaine
  - Identifier faux positifs
  - Identifier contenu manqué
  - **Durée** : 2h

- [ ] **T6.2.2** : Ajuster prompts routines
  - Ajouter critères de pertinence
  - Ajouter mots-clés négatifs
  - **Durée** : 2h

- [ ] **T6.2.3** : Tester prompts ajustés
  - Relancer routines
  - Vérifier amélioration pertinence
  - **Durée** : 1h

### 6.3 Documentation

- [ ] **T6.3.1** : Créer `docs/RUNBOOK.md`
  - Procédures de déploiement
  - Procédures de rollback
  - Procédures de debug
  - Procédures d'urgence
  - **Durée** : 2h
  - **Référence** : DESIGN.md section "Runbook Opérationnel"

- [ ] **T6.3.2** : Créer `docs/USAGE.md`
  - Commandes WhatsApp
  - Syntaxe des commandes
  - Exemples d'utilisation
  - FAQ
  - **Durée** : 1h

### 6.4 Stabilisation

- [ ] **T6.4.1** : Monitoring 7 jours consécutifs
  - Vérifier uptime >95%
  - Vérifier coût <5 USD/jour
  - Vérifier pertinence >80%
  - **Durée** : 7 jours (observation)

---

## ✅ Checklist de Validation Finale

### Phase 1 : MCP Wrapper ✅
- [x] Code TypeScript compilé sans erreur
- [x] Tests unitaires passent (100%)
- [x] Validation d'URL fonctionne
- [x] Sanitization détecte injections
- [x] Rate limiter respecte limites
- [x] Monitoring enregistre métriques
- [x] Logs JSON structurés

### Phase 2 : Test Gemini CLI
- [ ] MCP server démarre
- [ ] Gemini CLI appelle `archive_url`
- [ ] Fiche markdown créée
- [ ] Commit Git poussé
- [ ] Source dans NotebookLM
- [ ] Tests HackerNews, YouTube, Reddit passent

### Phase 3 : VPS
- [ ] VPS accessible via SSH (clé publique)
- [ ] Mot de passe SSH désactivé
- [ ] UFW activé
- [ ] Docker installé
- [ ] Utilisateur `openclaw` créé
- [ ] Repos clonés

### Phase 4 : OpenClaw
- [ ] docker-compose.yml configuré
- [ ] config.yaml créé
- [ ] .env configuré
- [ ] Containers démarrent
- [ ] MCP wrapper accessible
- [ ] Test WhatsApp manuel réussi

### Phase 5 : Routines
- [ ] Routine morning testée
- [ ] Routine afternoon testée
- [ ] Routine evening testée
- [ ] Tags automatiques corrects
- [ ] Rate limit respecté
- [ ] Cohabitation Discord OK

### Phase 6 : Production
- [ ] Prompts optimisés
- [ ] Taux pertinence >80%
- [ ] Coût quotidien <5 USD
- [ ] Pas de conflit Git
- [ ] Discord fonctionne
- [ ] Alertes configurées
- [ ] Backup automatique
- [ ] Documentation complète
- [ ] Stable 7 jours

---

## 📊 Suivi de Progression

| Phase | Tâches Complétées | Tâches Totales | Progression |
|-------|-------------------|----------------|-------------|
| Phase 1 | 11 | 12 | 92% ✅ |
| Phase 2 | 0 | 6 | 0% |
| Phase 3 | 0 | 8 | 0% |
| Phase 4 | 0 | 7 | 0% |
| Phase 5 | 0 | 6 | 0% |
| Phase 6 | 0 | 8 | 0% |
| **TOTAL** | **11** | **47** | **23%** |

---

## 🚀 Prochaines Étapes

1. **Commencer Phase 1** : Setup projet TypeScript
2. **Lire la documentation OpenClaw** : https://docs.openclaw.ai/start/getting-started
3. **Préparer environnement de dev** : Node.js, TypeScript, Docker

---

**Note :** Cocher les cases au fur et à mesure de l'avancement. Mettre à jour la section "Suivi de Progression" régulièrement.
