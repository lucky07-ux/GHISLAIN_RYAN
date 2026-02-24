# 🍱 LunchUp - Service de Livraison de Lunch Box au Cameroun

Plateforme complète de commande et livraison de lunch box au Cameroun, offrant une expérience utilisateur moderne avec un dashboard administrateur puissant.

## ✨ Caractéristiques Principales

### Client
- 🛒 Panier persistant avec LocalStorage
- 📝 Formulaire de commande avec validation complète
- 💳 Multiple méthodes de paiement (Orange Money, MTN Mobile Money, Cash)
- 📱 Design responsive et modern (Dark Mode)
- 💬 Système d'avis et de commentaires
- ⏰ Gestion des horaires d'ouverture

### Admin
- 📊 Dashboard avec statistiques en temps réel
- 🍽️ Gestion complète du menu hebdomadaire
- 📦 Suivi des commandes et changement de statut
- 💰 Suivi des paiements
- 👥 Gestion de la base clients
- 🔔 Notifications en temps réel
- ⚙️ Paramètres de l'application
- 📈 Graphiques et statistiques détaillées

## 🛠️ Stack Technique

### Frontend
- React 18+ avec Vite
- TypeScript (strict mode)
- Tailwind CSS
- React Router v6
- Zustand (state management)
- React Hook Form + Zod (validation)
- Axios
- React Hot Toast
- Lucide React (icons)
- Firebase

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT (authentification)
- Bcryptjs (hashage passwords)
- Nodemailer (emails)
- Socket.io (notifications temps réel)
- CORS, Helmet, Rate Limiting

## 📂 Structure du Projet

```
lunchup/
├── frontend/
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── layout/        # Layout components
│   │   │   ├── Cart.tsx       # Composant panier
│   │   │   ├── ProductCard.tsx
│   │   │   └── DayTabs.tsx
│   │   ├── pages/             # Pages principales
│   │   │   ├── Home.tsx
│   │   │   ├── checkout.tsx
│   │   │   └── Admin.tsx
│   │   ├── services/          # API services
│   │   │   ├── api.ts
│   │   │   ├── menuService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── authService.ts
│   │   │   ├── reviewService.ts
│   │   │   └── adminService.ts
│   │   ├── store/             # Zustand stores
│   │   │   ├── cartstore.ts
│   │   │   └── authStore.ts
│   │   ├── hooks/             # Custom hooks
│   │   ├── types/             # Types TypeScript
│   │   ├── utils/             # Utility functions
│   │   ├── config/            # Configuration
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   │   ├── authController.ts
│   │   │   ├── menuController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── customerController.ts
│   │   │   ├── statsController.ts
│   │   │   ├── notificationController.ts
│   │   │   └── settingsController.ts
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── MenuItem.ts
│   │   │   ├── Order.ts
│   │   │   ├── Customer.ts
│   │   │   ├── Review.ts
│   │   │   ├── Notification.ts
│   │   │   └── Settings.ts
│   │   ├── routes/            # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── menuRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── reviewRoutes.ts
│   │   │   ├── customerRoutes.ts
│   │   │   ├── notificationRoutes.ts
│   │   │   ├── statsRoutes.ts
│   │   │   └── settingsRoutes.ts
│   │   ├── middlewares/       # Custom middlewares
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── helpers.ts
│   │   │   └── email.ts
│   │   ├── config/            # Configuration
│   │   │   └── index.ts
│   │   ├── types/             # Types TypeScript
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
├── .gitignore
└── README.md
```

## 🚀 Installation et Configuration

### Prérequis
- Node.js 16+
- MongoDB (local ou Atlas)
- npm ou yarn

### 1. Cloner le Repository
```bash
git clone <repository-url>
cd lunchup
```

### 2. Installation Frontend

```bash
cd frontend
npm install
```

Créer `.env` à partir de `.env.example`:
```bash
cp .env.example .env
```

Éditer `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LunchUp
```

### 3. Installation Backend

```bash
cd ../backend
npm install
```

Créer `.env` à partir de `.env.example`:
```bash
cp .env.example .env
```

Éditer `.env` avec vos configurations:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lunchup?retryWrites=true&w=majority
MONGODB_LOCAL=mongodb://localhost:27017/lunchup
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@lunchup.cm
ADMIN_PASSWORD=SecurePassword123!
```

## 📦 Lancer le Projet Localement

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
L'application démarre sur `http://localhost:5173`

## 🔐 Authentification Admin

Accès au dashboard admin: `http://localhost:5173/admin/login`

**Identifiants par défaut** (à changer en production):
- Email: `admin@lunchup.cm`
- Password: `SecurePassword123!`

## 🔌 Endpoints API Principaux

### Public Routes
```
GET  /api/menu/current              - Menu semaine actuelle
GET  /api/menu/:day                 - Menu d'un jour
GET  /api/reviews                   - Avis approuvés
POST /api/reviews                   - Soumettre avis
POST /api/orders                    - Créer commande
GET  /api/orders/:orderNumber       - Détails commande
GET  /api/settings/public           - Paramètres publics
```

### Admin Routes (Protected)
```
POST /api/admin/login               - Login
GET  /api/admin/me                  - Utilisateur connecté
GET  /api/admin/orders              - Toutes commandes
PATCH /api/admin/orders/:id/status  - Changer statut
GET  /api/admin/menu                - Tous les plats
POST /api/admin/menu                - Créer plat
PUT  /api/admin/menu/:id            - Modifier plat
DELETE /api/admin/menu/:id          - Supprimer plat
GET  /api/admin/stats/overview      - Stats dashboard
GET  /api/admin/customers           - Tous clients
GET  /api/admin/notifications       - Notifications
```

## 📋 Base de Données

### Collections MongoDB

**Users**
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: 'admin' | 'super_admin',
  createdAt: Date,
  lastLogin: Date
}
```

**MenuItems**
```javascript
{
  name: String,
  description: String,
  price: Number,
  dayOfWeek: String (lundi-vendredi),
  weekNumber: Number,
  quantityAvailable: Number,
  isActive: Boolean,
  createdAt: Date
}
```

**Orders**
```javascript
{
  orderNumber: String (unique),
  customerInfo: { name, phone, email },
  items: [{ menuItemId, name, price, quantity }],
  status: String (pending, confirmed, processing, shipped, delivered),
  payment: { method, phoneNumber, status },
  pricing: { subtotal, deliveryFee, total },
  createdAt: Date
}
```

## 🎨 Palette de Couleurs

- **Primaire**: Orange vif `#FF6B35`
- **Secondaire**: Vert menthe `#10B981` / `#34D399`
- **Background**: Noir profond `#0A0A0A` / `#111111`
- **Cards**: Gris foncé `#1A1A1A` / `#1F1F1F`
- **Texte**: Blanc `#FFFFFF` / Gris clair `#D1D5DB`
- **Accents**: Violet `#8B5CF6`, Bleu `#3B82F6`, Rouge `#EF4444`

## 🚀 Déploiement

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Déployer le dossier dist sur Vercel
```

### Backend (Railway ou Render)
```bash
cd backend
npm run build
# Déployer sur Railway/Render
```

**Variables d'environnement production**:
- `NODE_ENV=production`
- `MONGODB_URI` = MongoDB Atlas URL
- `JWT_SECRET` = Secret key très sûr
- Autres clés API configurées

## 📝 Scripts Disponibles

### Frontend
```bash
npm run dev      # Développement (Vite)
npm run build    # Build production
npm run preview  # Preview production
npm run lint     # Linter code
```

### Backend
```bash
npm run dev      # Développement (tsx watch)
npm run build    # Build TypeScript
npm run start    # Production
npm run lint     # Linter code
```

## 🔒 Sécurité

✅ Passwords hachés avec bcryptjs (10 rounds)
✅ JWT tokens avec expiration
✅ Validation inputs côté client ET serveur
✅ Rate limiting sur API
✅ CORS configuré
✅ Helmet.js pour headers sécurité
✅ Sanitization données
✅ HTTPS recommandé en production

## 📞 Support et Contact

**Téléphone**: +237 6 91 71 02 89
**Email**: contact@lunchup.cm
**Instagram**: @LunchUpCMR
**Horaires**: Lundi-Vendredi 8H-15H

## 📄 License

MIT License - voir LICENSE.md

## 👨‍💻 Développement

Système complètement développé suivant les specs :
- ✅ Frontend complet avec pages clients
- ✅ Dashboard admin fonctionnel
- ✅ Backend API complète
- ✅ MongoDB schemas
- ✅ Authentification JWT
- ✅ Validation formules
- ✅ Gestion erreurs
- ✅ Structure professionnelle

**Version**: 1.0.0
**Last Updated**: Janvier 2026
