# 🔧 Configuration MongoDB et Lancement du Projet

## ✅ Étapes Complétées

- ✅ Dépendances frontend et backend installées
- ✅ Code TypeScript vérifié et compilé
- ✅ Duplicate index errors résolus

## 🚨 Prochaine Étape: MongoDB

Le backend a besoin d'une base de données MongoDB pour fonctionner.

### Option 1: MongoDB Atlas (Recommandé - Cloud)

**Avantages**: Pas besoin d'installer MongoDB localement, accès partout

1. **Créer un compte MongoDB Atlas**
   - Aller sur https://www.mongodb.com/cloud/atlas
   - Créer un compte gratuit
   - Créer un nouveau projet "LunchUp"

2. **Créer un cluster**
   - Choisir "Shared" (gratuit)
   - Sélectionner la région (ex: Frankfurt ou Ireland)
   - Cliquer "Create Cluster"

3. **Créer un utilisateur**
   - Aller à "Database Access"
   - Créer un utilisateur (ex: `lunchup_admin`)
   - Générer un mot de passe sécurisé

4. **Autoriser votre IP**
   - Aller à "Network Access"
   - Cliquer "Add IP Address"
   - Sélectionner "Add Current IP Address"

5. **Obtenir la connection string**
   - Cliquer "Connect" sur le cluster
   - Choisir "Drivers" 
   - Copier la URL de connexion

6. **Mettre à jour le fichier `.env` du backend**

```env
MONGODB_URI=mongodb+srv://lunchup_admin:PASSWORD@cluster.mongodb.net/lunchup?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

---

### Option 2: MongoDB Local (Installation)

**Avantages**: Plus rapide pour le développement

**Windows - Via Chocolatey:**

1. Ouvrir PowerShell en tant qu'administrateur
2. Installer Chocolatey (si pas déjà installé):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

3. Installer MongoDB:
```powershell
choco install mongodb-community
```

4. Vérifier l'installation:
```powershell
mongod --version
```

5. Lancer le service MongoDB:
```powershell
net start MongoDB
```

6. Mettre à jour `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/lunchup
PORT=5000
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

---

### Option 3: MongoDB via Docker (Avancé)

```bash
docker run -d --name lunchup-mongo -p 27017:27017 mongo:latest
```

---

## 🚀 Lancer le Projet

Une fois MongoDB configuré:

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

**✅ Succès** si vous voyez:
```
✓ Serveur démarré sur port 5000
✓ Connexion MongoDB établie
✓ Routes chargées avec succès
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

**✅ Succès** si vous voyez:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🌐 Accès aux Applications

| Partie | URL | Notes |
|--------|-----|-------|
| **Client** | http://localhost:5173 | Page d'accueil |
| **Admin** | http://localhost:5173/admin/login | Connexion admin |
| **API** | http://localhost:5000/api | Base de l'API |
| **Health Check** | http://localhost:5000/health | Vérifier serveur |

---

## 🔑 Identifiants Admin (Par Défaut)

**Email**: `admin@lunchup.cm`
**Password**: `SecurePassword123!`

⚠️ À CHANGER en production!

---

## 🐛 Troubleshooting

### Erreur: "connect ECONNREFUSED ::1:27017"

**Cause**: MongoDB n'est pas en cours d'exécution

**Solution**:
- **Windows**: Ouvrir Services > Chercher "MongoDB" > Démarrer le service
- **Mac/Linux**: `brew services start mongodb-community`
- **Docker**: `docker start lunchup-mongo`

### Erreur: "Port 5000 already in use"

```powershell
# Trouver le processus utilisant le port 5000
Get-NetTCPConnection -LocalPort 5000

# Tuer le processus (adapter PID)
Stop-Process -Id <PID> -Force
```

### Erreur: "Port 5173 already in use"

```bash
# Utiliser un autre port
npm run dev -- --port 5174
```

### Erreur: "Cannot find module 'tsx'"

```bash
# Réinstaller les dépendances
rm -r node_modules package-lock.json
npm install
```

---

## ✨ Prochaines Étapes

1. ✅ Configurer MongoDB (voir ci-dessus)
2. ✅ Lancer backend et frontend
3. ⏭️ Accéder à http://localhost:5173
4. ⏭️ Tester la page d'accueil
5. ⏭️ Aller à /admin/login pour le dashboard

---

## 📚 Documentation

- [README.md](README.md) - Vue d'ensemble complète
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Tous les endpoints
- [QUICK_START.md](QUICK_START.md) - Guide 5 minutes

---

**Besoin d'aide?** Vérifiez les logs du terminal pour plus de détails! 🚀
