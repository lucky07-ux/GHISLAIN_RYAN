# 🚀 Guide de Démarrage Rapide - LunchUp

## 📋 Prérequis

- Node.js 16+ 
- npm/yarn
- MongoDB (local ou cloud)

## ⚡ Installation en 5 minutes

### 1️⃣ Cloner et installer backend

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos config
npm run dev
```

**Vérifier**: http://localhost:5000/health

### 2️⃣ Installer et lancer frontend

```bash
# Terminal 2
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Accéder**: http://localhost:5173

## 🔑 Identifiants Admin

- **Email**: admin@lunchup.cm
- **Password**: SecurePassword123!

Accès: http://localhost:5173/admin/login

## 📍 Endpoints Clés

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/menu/current` | Menu semaine actuelle |
| POST | `/api/orders` | Créer commande |
| POST | `/api/admin/login` | Login admin |
| GET | `/api/admin/stats/overview` | Statistiques |

## 🎨 Variables d'environnement principales

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## ✅ Vérifications

- [x] API responds à http://localhost:5000/health
- [x] Frontend charge à http://localhost:5173
- [x] Connexion admin fonctionne
- [x] Panier localStorage fonctionne
- [x] Requêtes API réussissent

## 🐛 Troubleshooting

**Port déjà utilisé?**
```bash
# Changer le PORT dans .env backend
PORT=5001
```

**MongoDB non connecté?**
```bash
# Vérifier la connection string dans .env
MONGODB_URI=mongodb://localhost:27017/lunchup
```

**CORS error?**
```bash
# Vérifier FRONTEND_URL dans .env backend
FRONTEND_URL=http://localhost:5173
```

## 📚 Documentation Complète

Voir [README.md](./README.md) pour la documentation détaillée.

## 🎯 Prochaines étapes

1. Personnaliser le menu initial
2. Configurer les paiements (OM/MOMO)
3. Ajouter des images pour les plats
4. Configurer les emails
5. Déployer en production

Good luck! 🍱✨
