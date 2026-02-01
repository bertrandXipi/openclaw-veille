# Requirements : Intégration OpenClaw Agent Autonome

## 📋 Vue d'ensemble

Transformer le système de veille manuel (Discord) en système hybride avec un agent autonome (OpenClaw) qui chasse du contenu H24 sur Reddit/LinkedIn et obéit via WhatsApp, tout en préservant le système Discord existant.

**Repo OpenClaw :** https://github.com/openclaw/openclaw  
**Repo second-brain :** https://github.com/ton-username/second-brain

---

## 🎯 Objectifs Business

### Objectif Principal
Automatiser la veille technologique pour capturer du contenu pertinent 24/7 sans intervention manuelle, tout en gardant la possibilité de contrôle manuel via Discord.

### Objectifs Secondaires
1. Réduire le temps passé à chercher du contenu manuellement (de 2h/jour à 15min/jour)
2. Augmenter la quantité de contenu capturé (de 5-10 liens/jour à 20-30 liens/jour)
3. Améliorer la qualité du filtrage (agent IA vs. sélection manuelle)
4. Permettre le pilotage à distance via WhatsApp

---

## 👥 User Stories

### US-1 : Exposition du système existant via MCP
**En tant que** développeur  
**Je veux** exposer mon système de veille existant comme une API MCP  
**Afin que** OpenClaw puisse l'utiliser sans modifier le code existant

**Critères d'acceptation :**
- [ ] Un serveur MCP est créé dans `mcp-wrapper/`
- [ ] L'outil `archive_url` est exposé via MCP
- [ ] L'outil importe le code existant de `second-brain/batch-processor/` sans le modifier
- [ ] Le bot Discord continue de fonctionner normalement
- [ ] Aucune modification dans `second-brain/`

**Détails techniques :**
- Input : `{ url: string, tags?: string[], note?: string }`
- Output : `{ success: boolean, title: string, fichePath: string, notebookUrl: string, commitHash: string }`
- Réutilise : `notebooklm-http.js`, `markdown-generator-v2.js`, `simple-git`

---

### US-2 : Test du MCP avec Gemini CLI
**En tant que** développeur  
**Je veux** tester le serveur MCP avec Gemini CLI  
**Afin de** valider que l'outil fonctionne avant de déployer OpenClaw

**Critères d'acceptation :**
- [ ] Un script de test `test-mcp-gemini.sh` est créé
- [ ] Le script peut appeler `archive_url` via le serveur MCP
- [ ] Une fiche markdown est créée dans `fiches/YYYY-MM/`
- [ ] Un commit Git est poussé sur GitHub
- [ ] La source apparaît dans NotebookLM
- [ ] Le test fonctionne avec HackerNews, YouTube et Reddit

**Détails techniques :**
- Utilise `child_process.spawn` pour lancer le serveur MCP
- Communique via stdin/stdout (JSON-RPC)
- Vérifie le résultat dans le filesystem et Git

---

### US-3 : Provisionnement du VPS
**En tant que** développeur  
**Je veux** provisionner un VPS sécurisé avec Docker  
**Afin de** héberger OpenClaw de manière isolée

**Critères d'acceptation :**
- [ ] VPS provisionné (Hetzner CPX21 ou équivalent)
- [ ] Connexion SSH configurée (clé publique uniquement)
- [ ] Firewall UFW activé (ports 22, 80, 443)
- [ ] Docker et Docker Compose installés
- [ ] Utilisateur non-root `openclaw` créé
- [ ] Repos `second-brain` et `openclaw-veille` clonés sur le VPS

**Détails techniques :**
- OS : Ubuntu 24.04 LTS
- RAM : 4GB minimum
- Stockage : 80GB minimum
- Localisation : Europe (latence)

---

### US-4 : Configuration OpenClaw
**En tant que** développeur  
**Je veux** configurer OpenClaw pour utiliser mon MCP  
**Afin que** l'agent puisse archiver du contenu automatiquement

**Critères d'acceptation :**
- [ ] `docker-compose.yml` créé avec services `openclaw` et `mcp-wrapper`
- [ ] `openclaw-config/config.yaml` créé avec routines Reddit
- [ ] `.env` configuré avec credentials (Gemini, GitHub, WhatsApp)
- [ ] Le serveur MCP est accessible depuis le container OpenClaw
- [ ] Les volumes Docker sont correctement montés

**Détails techniques :**
- Network Docker : `brain-network`
- MCP accessible via : `http://mcp-wrapper:3000`
- Volumes : `/opt/second-brain/batch-processor:/app/batch-processor:ro`

---

### US-5 : Veille autonome Reddit
**En tant qu'** utilisateur  
**Je veux** qu'OpenClaw scanne Reddit 3x par jour  
**Afin de** capturer automatiquement du contenu pertinent

**Critères d'acceptation :**
- [ ] Routine `reddit-morning-hunt` configurée (8h)
- [ ] Routine `reddit-afternoon-hunt` configurée (14h)
- [ ] Routine `reddit-evening-hunt` configurée (20h)
- [ ] Subreddits ciblés : r/programming, r/MachineLearning, r/webdev, r/node, r/reactjs
- [ ] Filtre : posts >100 upvotes des dernières 24h
- [ ] Maximum 10 posts archivés par session
- [ ] Tags automatiques ajoutés (ex: ["reddit", "ai"])
- [ ] Fiches markdown créées dans Git

**Détails techniques :**
- Utilise le browser headless d'OpenClaw
- Délai aléatoire entre actions : 3-8 secondes
- Limite quotidienne : 30 archives max

---

### US-6 : Pilotage via WhatsApp
**En tant qu'** utilisateur  
**Je veux** envoyer des commandes à OpenClaw via WhatsApp  
**Afin de** archiver du contenu à la demande depuis mon téléphone

**Critères d'acceptation :**
- [ ] OpenClaw connecté à WhatsApp (numéro configuré)
- [ ] Commande : "Archive https://example.com" → archive l'URL
- [ ] Commande : "Archive https://example.com #ai #nodejs" → archive avec tags
- [ ] Réponse WhatsApp : "✅ Archivé : [Titre de l'article]"
- [ ] Réponse en cas d'erreur : "❌ Erreur : [message]"
- [ ] Seul mon numéro peut envoyer des commandes (whitelist)

**Détails techniques :**
- Utilise WhatsApp Web (via Puppeteer ou équivalent)
- Parse les hashtags comme tags
- Timeout : 60 secondes max par archive

---

### US-7 : Cohabitation Discord + OpenClaw
**En tant que** développeur  
**Je veux** que Discord et OpenClaw cohabitent  
**Afin de** garder les deux modes (manuel + autonome)

**Critères d'acceptation :**
- [ ] Bot Discord continue de tourner sur Google Cloud Run
- [ ] OpenClaw tourne sur le VPS
- [ ] Les deux écrivent dans le même repo Git (fiches-veille)
- [ ] Pas de conflit Git (commits séparés)
- [ ] Les sources Discord ont tag `ingest_source: discord`
- [ ] Les sources OpenClaw ont tag `ingest_source: openclaw`
- [ ] NotebookLM contient les sources des deux systèmes

**Détails techniques :**
- Git pull avant chaque commit (éviter conflits)
- Messages de commit différents : `feat(discord):` vs `feat(openclaw):`

---

### US-8 : Monitoring et Logs
**En tant que** développeur  
**Je veux** monitorer l'activité d'OpenClaw  
**Afin de** détecter les problèmes et optimiser les prompts

**Critères d'acceptation :**
- [ ] Logs Docker accessibles : `docker-compose logs -f openclaw`
- [ ] Script de monitoring : `scripts/monitor-openclaw.sh`
- [ ] Affiche : nombre d'archives du jour, dernières archives, statut containers
- [ ] Rotation des logs Docker (max 10MB par fichier, 3 fichiers)
- [ ] Backup quotidien des données OpenClaw (2h du matin)

**Détails techniques :**
- Logs JSON avec timestamps
- Backup : `tar -czf openclaw-YYYYMMDD.tar.gz openclaw-data/`
- Rétention : 30 jours

---

## 🔒 Contraintes Techniques

### CT-1 : Non-régression
Le système Discord existant (`second-brain`) **ne doit pas être modifié** et doit continuer de fonctionner normalement pendant et après le déploiement d'OpenClaw.

### CT-2 : Isolation
Le code MCP doit être dans un repo séparé (`openclaw-veille`) et importer le code existant en lecture seule.

### CT-3 : Sécurité VPS
- SSH : clé publique uniquement (pas de mot de passe)
- Firewall : UFW activé, ports minimaux ouverts
- Utilisateur non-root pour Docker
- Credentials dans `.env` (non commité)

### CT-4 : Rate Limits
- Reddit : max 10 pages par session, délai 3-8s entre actions
- NotebookLM : respecter les limites API
- Gemini : max 200 appels/heure
- Coût quotidien : max 5 USD/jour

### CT-5 : Compatibilité Git
- Pull avant chaque commit (éviter conflits)
- Messages de commit descriptifs
- Pas de force push

---

## 📊 Métriques de Succès

### Métriques Quantitatives
- **Nombre d'archives/jour** : 20-30 (vs. 5-10 actuellement)
- **Temps de veille manuelle** : 15min/jour (vs. 2h actuellement)
- **Taux de pertinence** : >80% des archives sont pertinentes
- **Uptime OpenClaw** : >95%
- **Coût API** : <5 USD/jour

### Métriques Qualitatives
- Le contenu archivé est pertinent pour mes intérêts (IA, Node.js, React, freelancing)
- Les fiches markdown sont bien formatées
- Les commits Git sont propres et descriptifs
- Le système est facile à monitorer et débugger

---

## 🚫 Hors Scope (V1)

Les fonctionnalités suivantes ne sont **pas** incluses dans la V1 :

- [ ] Veille LinkedIn (prévu V2)
- [ ] Veille Twitter/X (API payante)
- [ ] Interface web pour piloter OpenClaw
- [ ] Multi-agents (un par source)
- [ ] Fine-tuning du modèle
- [ ] Génération automatique de digests
- [ ] Notifications Discord des archives OpenClaw

---

## 🔄 Dépendances

### Dépendances Externes
- **OpenClaw** : https://github.com/openclaw/openclaw (agent autonome)
- **NotebookLM MCP** : Serveur MCP NotebookLM déjà déployé
- **GitHub** : Repo `fiches-veille` accessible en écriture
- **Gemini API** : Clé API valide avec quota suffisant
- **WhatsApp** : Numéro de téléphone pour connexion

### Dépendances Internes
- **second-brain/batch-processor/** : Code existant (notebooklm-http.js, fetch-content.js, markdown-generator-v2.js)
- **second-brain/discord-ingest-bot/** : Bot Discord (doit continuer de fonctionner)
- **Git repo** : fiches-veille sur GitHub

---

## 📅 Planning Estimé

| Phase | Durée | Dépendances |
|-------|-------|-------------|
| Phase 1 : MCP Wrapper | 1-2 jours | Aucune |
| Phase 2 : Test Gemini CLI | 1 jour | Phase 1 |
| Phase 3 : VPS Setup | 1-2 jours | Aucune (parallèle) |
| Phase 4 : Config OpenClaw | 1 jour | Phase 1, 3 |
| Phase 5 : Déploiement | 1 jour | Phase 1-4 |
| Phase 6 : Optimisation | 3-5 jours | Phase 5 |
| **TOTAL** | **8-12 jours** | |

---

## 🔐 Sécurité et Confidentialité

### Données Sensibles
- **Credentials** : Stockés dans `.env` (non commité, ajouté à `.gitignore`)
- **Cookies NotebookLM** : Stockés sur le VPS uniquement
- **Clés SSH** : Générées sur machine locale, publique copiée sur VPS

### Accès
- **VPS** : Accessible uniquement via SSH avec clé publique
- **WhatsApp** : Whitelist d'un seul numéro (le mien)
- **Git** : Token GitHub avec scope `repo` uniquement

### Logs
- Pas de credentials dans les logs
- Logs Docker avec rotation automatique
- Backup chiffré (optionnel V2)

---

## 📝 Notes Techniques

### Architecture OpenClaw
D'après le repo https://github.com/openclaw/openclaw :
- Agent autonome basé sur LLM (Gemini, Claude, GPT)
- Support MCP natif pour outils externes
- Browser headless intégré (Puppeteer)
- Routines planifiées (cron-like)
- Support WhatsApp via WhatsApp Web

### Choix Techniques
- **VPS** : Hetzner CPX21 (7€/mois) plutôt que Cloud Run (stateless)
- **Docker** : Isolation et portabilité
- **MCP** : Standard pour exposer des outils à des agents IA
- **TypeScript** : Pour le wrapper MCP (typage fort)
- **Repos séparés** : `second-brain` (existant) et `openclaw-veille` (nouveau)

### Risques Identifiés
1. **Rate limiting Reddit** : Mitigation via délais aléatoires
2. **Coûts API Gemini** : Mitigation via quotas quotidiens
3. **Conflits Git** : Mitigation via pull avant commit
4. **Faux positifs** : Mitigation via affinage des prompts (Phase 6)
5. **Prompt injection** : Mitigation via validation et sanitization (voir DESIGN.md)

---

## ✅ Critères de Validation Globaux

Le projet est considéré comme réussi si :

1. ✅ Le wrapper MCP fonctionne et expose `archive_url`
2. ✅ OpenClaw tourne sur le VPS sans erreur
3. ✅ La routine Reddit archive 10-30 posts/jour
4. ✅ Les commandes WhatsApp fonctionnent
5. ✅ Le bot Discord continue de fonctionner
6. ✅ Les fiches markdown sont créées correctement
7. ✅ Les commits Git sont propres
8. ✅ Le coût API reste <5 USD/jour
9. ✅ Le système est stable pendant 7 jours consécutifs

---

## 📚 Références

### Documentation OpenClaw (À consulter pendant l'implémentation)
- **Documentation officielle** : https://docs.openclaw.ai/start/getting-started
- **GitHub OpenClaw** : https://github.com/openclaw/openclaw
- **README OpenClaw** : https://github.com/openclaw/openclaw?tab=readme-ov-file

**⚠️ Important :** Consulter la documentation OpenClaw avant chaque phase d'implémentation pour respecter :
- Les conventions de configuration (config.yaml)
- L'architecture des routines
- Le format des prompts
- La connexion MCP
- Le setup WhatsApp

### Autres Références
- **MCP Protocol** : https://modelcontextprotocol.io/
- **NotebookLM** : https://notebooklm.google.com/
- **second-brain** : https://github.com/ton-username/second-brain

