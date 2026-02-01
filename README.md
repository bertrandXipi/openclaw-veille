# OpenClaw Veille - Agent Autonome de Veille Technologique

Agent IA autonome basé sur [OpenClaw](https://github.com/openclaw/openclaw) pour automatiser la veille technologique sur Reddit, LinkedIn et autres sources.

## 🎯 Objectif

Transformer la veille manuelle (Discord) en système hybride avec un agent autonome qui :
- Scanne Reddit 3x par jour (8h, 14h, 20h)
- Archive automatiquement le contenu pertinent
- Peut être piloté via WhatsApp
- Cohabite avec le système Discord existant

## 📊 Métriques Cibles

- **Archives/jour** : 20-30 (vs. 5-10 actuellement)
- **Temps de veille manuelle** : <15min/jour (vs. 2h actuellement)
- **Taux de pertinence** : >80%
- **Coût API** : <5 USD/jour

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                              │
│  Discord (manuel) ←→ WhatsApp (commandes) ←→ Monitoring (SSH)  │
└────────────┬──────────────────────┬──────────────────────┬──────┘
             │                      │                      │
             ▼                      ▼                      ▼
┌────────────────────┐  ┌──────────────────────┐  ┌──────────────┐
│  Discord Bot       │  │  OpenClaw Agent      │  │  Monitoring  │
│  (Google Cloud Run)│  │  (VPS Hetzner)       │  │  Scripts     │
└────────┬───────────┘  └──────────┬───────────┘  └──────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    MCP WRAPPER (TypeScript)                     │
│                    mcp-wrapper/                                 │
│                                                                 │
│  - Tool: archive_url                                           │
│  - Input validation & sanitization                             │
│  - Rate limiting                                                │
│  - Security checks                                              │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              SERVICES EXTERNES (via second-brain)               │
│  NotebookLM MCP Server | GitHub fiches-veille | Gemini API    │
└────────────────────────────────────────────────────────────────┘
```

## 📁 Structure du Projet

```
openclaw-veille/
├── mcp-wrapper/              # Wrapper MCP TypeScript
│   ├── src/
│   │   ├── index.ts          # MCP server entry point
│   │   ├── tools/
│   │   │   └── archive-url.ts
│   │   ├── validation.ts
│   │   ├── content-sanitizer.ts
│   │   ├── rate-limiter.ts
│   │   ├── monitoring.ts
│   │   └── logger.ts
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── openclaw-config/          # Configuration OpenClaw
│   └── config.yaml
│
├── scripts/                  # Scripts de monitoring
│   ├── monitor-openclaw.sh
│   ├── backup-openclaw.sh
│   └── test-mcp-gemini.sh
│
├── docker-compose.yml        # Docker pour VPS
├── .env.example
├── .gitignore
│
└── docs/
    ├── REQUIREMENTS.md       # Spécifications fonctionnelles
    ├── DESIGN.md            # Architecture technique
    ├── TASKS.md             # Liste des tâches
    └── RUNBOOK.md           # Guide opérationnel
```

## 🔐 Sécurité

**Défense en profondeur contre les prompt injections (Gemini Flash) :**

1. **Validation d'entrée** : Whitelist de domaines autorisés
2. **Sanitization** : Nettoyage du contenu fetché
3. **Rate limiting** : 30 archives/jour max, 30s min entre archives
4. **Monitoring** : Alertes sur anomalies, arrêt automatique si budget dépassé
5. **Isolation VPS** : Docker sans privilèges, firewall UFW
6. **Audit logs** : Logs JSON structurés, rétention 30 jours

## 🚀 Quick Start

### Prérequis

- Node.js ≥ 20
- Docker & Docker Compose
- VPS Ubuntu 24.04 (Hetzner CPX21 recommandé)
- Accès au repo [second-brain](https://github.com/ton-username/second-brain)

### Installation Locale (Développement)

```bash
# Cloner le repo
git clone https://github.com/ton-username/openclaw-veille.git
cd openclaw-veille

# Installer les dépendances du MCP wrapper
cd mcp-wrapper
npm install
npm run build

# Lancer les tests
npm test

# Tester avec Gemini CLI
cd ..
./scripts/test-mcp-gemini.sh
```

### Déploiement VPS

Voir [docs/RUNBOOK.md](docs/RUNBOOK.md) pour les instructions détaillées.

## 📚 Documentation

- [Requirements](docs/REQUIREMENTS.md) - Spécifications fonctionnelles
- [Design](docs/DESIGN.md) - Architecture technique détaillée
- [Tasks](docs/TASKS.md) - Liste des tâches d'implémentation
- [Runbook](docs/RUNBOOK.md) - Guide opérationnel (déploiement, monitoring, debug)

## 🔗 Projets Liés

- [second-brain](https://github.com/ton-username/second-brain) - Système de veille Discord (existant)
- [OpenClaw](https://github.com/openclaw/openclaw) - Framework d'agent IA autonome

## 📊 Roadmap

- [x] Phase 0 : Spécifications et design
- [ ] Phase 1 : MCP Wrapper (Jours 1-2)
- [ ] Phase 2 : Test Gemini CLI (Jour 3)
- [ ] Phase 3 : VPS Setup (Jours 3-4)
- [ ] Phase 4 : Déploiement OpenClaw (Jours 5-6)
- [ ] Phase 5 : Configuration Routines (Jour 7)
- [ ] Phase 6 : Optimisation (Jours 8-12)

## 📝 License

MIT

## 👤 Auteur

[Ton nom]

---

**Note :** Ce projet utilise le code de `second-brain` en lecture seule (via volumes Docker). Aucune modification du code existant n'est nécessaire.
