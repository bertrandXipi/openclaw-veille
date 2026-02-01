# Git Workflow : Règles Strictes

**RÈGLE D'OR : Tout passe par GitHub. Aucune exception.**

---

## 🔴 Principes Fondamentaux

### 1. Aucune Modification Directe sur le VPS

```bash
# ❌ INTERDIT
ssh openclaw@vps-ip
cd /opt/openclaw-veille
nano mcp-wrapper/src/index.ts  # ← NE PAS FAIRE

# ✅ CORRECT
# Éditer localement, commit, push, puis pull sur le VPS
```

### 2. Tout Doit Être Commité

```bash
# ❌ INTERDIT
npm install some-package  # Sans ajouter à package.json
docker-compose up -d      # Sans commiter docker-compose.yml

# ✅ CORRECT
npm install some-package
git add package.json package-lock.json
git commit -m "deps: add some-package"
git push origin main
```

### 3. Pas de Fichiers Non-Versionés en Production

```bash
# ❌ INTERDIT
# Fichiers sur le VPS qui ne sont pas dans Git :
/opt/openclaw-veille/config-local.yaml
/opt/openclaw-veille/temp-fix.js

# ✅ CORRECT
# Tous les fichiers sont dans Git
# Les secrets (.env) sont dans .gitignore
```

---

## 📋 Workflow Complet

### Étape 1 : Développer Localement

```bash
# Sur macOS
cd openclaw-veille

# Créer une branche (optionnel mais recommandé)
git checkout -b feature/my-feature

# Développer
nano mcp-wrapper/src/tools/archive-url.ts
npm test
npm run build

# Vérifier les changements
git status
git diff
```

### Étape 2 : Commiter avec Message Descriptif

```bash
# Ajouter les fichiers
git add mcp-wrapper/src/tools/archive-url.ts
git add mcp-wrapper/test/archive-url.test.ts

# Commiter avec message clair
git commit -m "feat(mcp): implement archive_url tool with validation

- Add URL whitelist validation
- Add content sanitization
- Add rate limiting
- Add comprehensive tests"

# Vérifier le commit
git log -1
```

### Étape 3 : Pousser sur GitHub

```bash
# Pousser la branche
git push origin feature/my-feature

# Ou directement sur main (si pas de PR)
git push origin main

# Vérifier sur GitHub
# https://github.com/YOUR_USERNAME/openclaw-veille
```

### Étape 4 : Déployer sur le VPS

```bash
# SSH sur le VPS
ssh openclaw@vps-ip

# Aller dans le dossier
cd /opt/openclaw-veille

# Vérifier la branche actuelle
git branch

# Passer sur main si nécessaire
git checkout main

# Puller les changements
git pull origin main

# Vérifier les changements
git log -1
git status

# Redéployer
cd mcp-wrapper
npm install  # Si package.json a changé
npm run build
cd ..
docker-compose restart

# Vérifier les logs
docker-compose logs -f openclaw
```

---

## 🔄 Cas Courants

### Cas 1 : Modifier le Code MCP Wrapper

```bash
# Localement
cd openclaw-veille/mcp-wrapper
nano src/tools/archive-url.ts
npm test
npm run build

# Commit
git add src/
git commit -m "fix(mcp): improve error handling in archive_url"
git push origin main

# Sur le VPS
git pull
npm run build
docker-compose restart
```

### Cas 2 : Ajouter une Dépendance

```bash
# Localement
cd openclaw-veille/mcp-wrapper
npm install zod@latest

# Commit (package.json et package-lock.json)
git add package.json package-lock.json
git commit -m "deps: upgrade zod to latest"
git push origin main

# Sur le VPS
git pull
npm install
npm run build
docker-compose restart
```

### Cas 3 : Modifier la Configuration OpenClaw

```bash
# Localement
nano openclaw-veille/openclaw-config/config.yaml

# Commit
git add openclaw-config/config.yaml
git commit -m "config: adjust reddit routines for better filtering"
git push origin main

# Sur le VPS
git pull
docker-compose restart
```

### Cas 4 : Ajouter un Script

```bash
# Localement
nano openclaw-veille/scripts/monitor-openclaw.sh
chmod +x openclaw-veille/scripts/monitor-openclaw.sh

# Commit
git add scripts/monitor-openclaw.sh
git commit -m "scripts: add monitoring script"
git push origin main

# Sur le VPS
git pull
chmod +x scripts/monitor-openclaw.sh
./scripts/monitor-openclaw.sh
```

---

## 🚫 Ce qui NE va PAS dans Git

### Fichiers à Ignorer (.gitignore)

```
# Secrets
.env
.env.local
.env.*.local

# Données
openclaw-data/
backups/
logs/

# Build
dist/
node_modules/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
```

### Où Mettre les Secrets

```bash
# Sur le VPS uniquement
/opt/openclaw-veille/.env

# Contenu (exemple)
GEMINI_API_KEY=AIza...
GITHUB_TOKEN=ghp_...
MY_PHONE_NUMBER=+33612345678
```

---

## 🔍 Vérification Avant Commit

### Checklist

- [ ] Code compilé sans erreur : `npm run build`
- [ ] Tests passent : `npm test`
- [ ] Pas de fichiers secrets : `git status | grep -E "\.env|credentials|secret"`
- [ ] Message de commit descriptif
- [ ] Pas de `console.log` de debug
- [ ] Pas de fichiers temporaires

### Commandes Utiles

```bash
# Voir les changements
git diff

# Voir les fichiers à commiter
git status

# Voir l'historique
git log --oneline -10

# Voir les changements d'un commit
git show HEAD

# Annuler les changements locaux
git checkout -- mcp-wrapper/src/index.ts

# Annuler le dernier commit (avant push)
git reset --soft HEAD~1
```

---

## 🆘 Erreurs Courantes

### Erreur 1 : "Permission denied" sur le VPS

```bash
# Cause : Fichier script sans permission d'exécution
# Solution : Commiter avec permission
git add -A
git commit -m "fix: add execute permission to scripts"
git push

# Sur le VPS
git pull
chmod +x scripts/*.sh
```

### Erreur 2 : "Changes not staged for commit"

```bash
# Cause : Fichiers modifiés mais pas ajoutés
# Solution : Ajouter et commiter
git add .
git commit -m "description"
git push
```

### Erreur 3 : "Your branch is behind"

```bash
# Cause : Quelqu'un d'autre a poussé
# Solution : Puller d'abord
git pull origin main
# Puis pousser
git push origin main
```

### Erreur 4 : "Rejected (non-fast-forward)"

```bash
# Cause : Historique divergent
# Solution : NE PAS utiliser --force
# À la place :
git pull --rebase origin main
git push origin main
```

---

## 📊 Bonnes Pratiques

### Messages de Commit

**Format :**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types :**
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage
- `refactor` : Refactorisation
- `test` : Tests
- `chore` : Maintenance
- `deps` : Dépendances

**Exemples :**
```
feat(mcp): implement archive_url tool
fix(validation): improve URL whitelist check
docs(readme): add quick start guide
deps: upgrade zod to 3.22.0
```

### Commits Atomiques

```bash
# ✅ BON : Un commit par changement logique
git commit -m "feat(mcp): add validation"
git commit -m "test(mcp): add validation tests"
git commit -m "docs(mcp): document validation"

# ❌ MAUVAIS : Tout dans un commit
git commit -m "add validation, tests, and docs"
```

### Fréquence des Commits

```bash
# ✅ BON : Commiter régulièrement
# Après chaque fonctionnalité complète
# Après chaque test qui passe
# Après chaque documentation

# ❌ MAUVAIS : Un seul commit à la fin
# Risque de perte de travail
# Difficile à débugger
```

---

## 🔐 Sécurité

### Vérifier avant de Pousser

```bash
# Vérifier qu'il n'y a pas de secrets
git diff --cached | grep -i "password\|token\|key\|secret"

# Vérifier qu'il n'y a pas de fichiers sensibles
git status | grep -E "\.env|credentials|\.pem"

# Vérifier le contenu du commit
git show --stat
```

### En Cas de Fuite de Secret

```bash
# 1. Révoquer le secret immédiatement
# (ex: GitHub token, API key)

# 2. Supprimer du historique Git
git filter-branch --tree-filter 'rm -f .env' HEAD

# 3. Forcer le push (une seule fois)
git push --force-with-lease origin main

# 4. Notifier l'équipe
```

---

## 📚 Références

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Dernière mise à jour :** 2026-02-01
