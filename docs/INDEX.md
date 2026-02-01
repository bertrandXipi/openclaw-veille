# Documentation OpenClaw Veille

Index de toute la documentation du projet.

## 📚 Documents Principaux

### 1. [README.md](../README.md)
Vue d'ensemble du projet, architecture, quick start.

**À lire en premier** pour comprendre le projet.

---

### 2. [REQUIREMENTS.md](./REQUIREMENTS.md)
Spécifications fonctionnelles complètes.

**Contenu :**
- 8 User Stories détaillées
- Critères d'acceptation
- Contraintes techniques
- Métriques de succès
- Planning estimé

**À lire pour :** Comprendre QUOI construire.

---

### 3. [DESIGN.md](./DESIGN.md)
Architecture technique détaillée.

**Contenu :**
- Architecture globale (diagrammes)
- Sécurité (défense en profondeur contre prompt injection)
- Composants techniques (MCP wrapper, OpenClaw config, VPS)
- Décisions techniques
- Stratégie de test

**À lire pour :** Comprendre COMMENT construire.

---

### 4. [TASKS.md](./TASKS.md)
Liste détaillée des tâches d'implémentation.

**Contenu :**
- 47 tâches organisées en 6 phases
- Durée estimée par tâche
- Checklist de validation
- Suivi de progression

**À lire pour :** Savoir QUOI faire et QUAND.

---

### 5. [INTEGRATION-SECOND-BRAIN.md](./INTEGRATION-SECOND-BRAIN.md)
Relation avec le projet second-brain.

**Contenu :**
- Comment openclaw-veille utilise le code de second-brain
- Configuration Docker (volumes read-only)
- Workflow de déploiement
- Troubleshooting

**À lire pour :** Comprendre la cohabitation des deux projets.

---

### 6. [GIT-WORKFLOW.md](./GIT-WORKFLOW.md)
Règles strictes pour le versioning et le déploiement.

**Contenu :**
- Règle d'or : tout passe par GitHub
- Workflow complet (local → GitHub → VPS)
- Cas courants (modifier code, ajouter dépendances, etc.)
- Bonnes pratiques (messages de commit, commits atomiques)
- Sécurité (vérifier avant de pousser)

**À lire pour :** Comprendre le workflow Git obligatoire.

---

## 📖 Documents à Créer (Phase 6)

### 7. RUNBOOK.md (À créer)
Guide opérationnel pour le déploiement et la maintenance.

**Contenu prévu :**
- Procédures de déploiement
- Procédures de rollback
- Procédures de debug
- Procédures d'urgence (budget dépassé, boucle infinie, etc.)

---

### 8. USAGE.md (À créer)
Guide utilisateur pour piloter OpenClaw.

**Contenu prévu :**
- Commandes WhatsApp
- Syntaxe des commandes
- Exemples d'utilisation
- FAQ

---

## 🔗 Références Externes

### Documentation OpenClaw
- **Getting Started** : https://docs.openclaw.ai/start/getting-started
- **GitHub** : https://github.com/openclaw/openclaw
- **README** : https://github.com/openclaw/openclaw?tab=readme-ov-file

### Documentation MCP
- **Protocol** : https://modelcontextprotocol.io/
- **SDK** : https://github.com/modelcontextprotocol/sdk

### Autres
- **NotebookLM** : https://notebooklm.google.com/
- **Gemini API** : https://ai.google.dev/docs
- **second-brain** : https://github.com/YOUR_USERNAME/second-brain

---

## 🗺️ Parcours de Lecture Recommandé

### Pour Démarrer le Projet
1. README.md (vue d'ensemble)
2. REQUIREMENTS.md (comprendre les objectifs)
3. DESIGN.md (comprendre l'architecture)
4. **GIT-WORKFLOW.md** (comprendre les règles Git)
5. TASKS.md (commencer l'implémentation)

### Pour Déployer
1. GIT-WORKFLOW.md (workflow obligatoire)
2. INTEGRATION-SECOND-BRAIN.md (comprendre la relation)
3. TASKS.md Phase 3-5 (VPS, OpenClaw, déploiement)
4. RUNBOOK.md (procédures opérationnelles)

### Pour Utiliser
1. README.md (quick start)
2. USAGE.md (commandes WhatsApp)

### Pour Débugger
1. GIT-WORKFLOW.md (vérifier les commits)
2. RUNBOOK.md (troubleshooting)
3. INTEGRATION-SECOND-BRAIN.md (vérifier cohabitation)
4. DESIGN.md (comprendre les composants)

---

## 📊 État de la Documentation

| Document | Statut | Complétude |
|----------|--------|------------|
| README.md | ✅ Complet | 100% |
| REQUIREMENTS.md | ✅ Complet | 100% |
| DESIGN.md | ✅ Complet | 100% |
| TASKS.md | ✅ Complet | 100% |
| INTEGRATION-SECOND-BRAIN.md | ✅ Complet | 100% |
| RUNBOOK.md | ⏳ À créer | 0% |
| USAGE.md | ⏳ À créer | 0% |

---

## 🤝 Contribution

Pour contribuer à la documentation :

1. Lire les documents existants
2. Identifier les manques ou imprécisions
3. Proposer des améliorations
4. Mettre à jour cet index si nécessaire

---

**Dernière mise à jour :** 2026-02-01
