# 📡 Documentation API LunchUp

Base URL: `http://localhost:5000/api`

## 🔐 Authentification

Les routes protégées nécessitent un header Authorization:
```
Authorization: Bearer <token>
```

Le token est obtenu après login à `/admin/login` et est valable 7 jours.

---

## 📋 Public Routes (Sans authentification)

### Menu

#### GET /menu/current
Récupère le menu de la semaine actuelle

**Response:**
```json
{
  "success": true,
  "weekNumber": 4,
  "year": 2026,
  "menuItems": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Poulet DG",
      "price": 2500,
      "dayOfWeek": "lundi",
      "quantityAvailable": 15,
      "accompaniments": "Riz, Plantain, Salade"
    }
  ]
}
```

#### GET /menu/:day
Récupère le menu d'un jour spécifique

**Parameters:**
- `day` (string): lundi, mardi, mercredi, jeudi, vendredi

---

### Orders

#### POST /orders
Crée une nouvelle commande

**Request Body:**
```json
{
  "customerInfo": {
    "name": "Jean Kouam",
    "phone": "+237691710289",
    "email": "jean@example.com"
  },
  "deliveryInfo": {
    "type": "campus",
    "address": "Université de Yaoundé 1",
    "instructions": "Devant la bibliothèque"
  },
  "items": [
    {
      "menuItemId": "507f1f77bcf86cd799439011",
      "name": "Poulet DG",
      "price": 2500,
      "quantity": 2
    }
  ],
  "payment": {
    "method": "cash",
    "phoneNumber": null
  },
  "specialInstructions": "Sans piment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Commande créée avec succès",
  "order": {
    "orderNumber": "CMD-123456ABC",
    "total": 6000,
    "status": "pending"
  }
}
```

#### GET /orders/:orderNumber
Récupère les détails d'une commande

**Example:** `/orders/CMD-123456ABC`

---

### Reviews

#### GET /reviews
Récupère tous les avis approuvés

**Query Parameters:**
- `page` (number): Numéro de page (défaut: 1)
- `limit` (number): Résultats par page (défaut: 10)

**Response:**
```json
{
  "success": true,
  "averageRating": "4.5",
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerName": "Marie D.",
      "rating": 5,
      "comment": "Excellente cuisine!",
      "createdAt": "2026-01-22T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /reviews
Soumet un nouvel avis (en attente de modération)

**Request Body:**
```json
{
  "customerName": "Jean K.",
  "rating": 5,
  "comment": "Meilleur rapport qualité-prix sur le campus!"
}
```

---

### Settings

#### GET /settings/public
Récupère les informations publiques

**Response:**
```json
{
  "success": true,
  "settings": {
    "businessInfo": {
      "name": "LunchUp",
      "phone": "+237 6 91 71 02 89",
      "hours": "Lundi-Vendredi: 8H-15H"
    }
  }
}
```

---

## 🔒 Protected Routes (Admin)

### Authentication

#### POST /admin/login
Authentifie un admin

**Request Body:**
```json
{
  "email": "admin@lunchup.cm",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@lunchup.cm",
    "name": "Administrateur",
    "role": "super_admin"
  }
}
```

#### GET /admin/me
Récupère l'utilisateur connecté

---

### Menu Management

#### GET /admin/menu
Récupère tous les plats (non filtré par semaine)

#### POST /admin/menu
Crée un nouveau plat

**Request Body:**
```json
{
  "name": "Poisson braisé",
  "description": "Poisson frais braisé avec accompagnements",
  "price": 3000,
  "dayOfWeek": "mardi",
  "quantityAvailable": 20,
  "category": "Poisson"
}
```

#### PUT /admin/menu/:id
Modifie un plat

#### DELETE /admin/menu/:id
Supprime un plat

#### PATCH /admin/menu/:id/stock
Met à jour le stock d'un plat

**Request Body:**
```json
{
  "quantityAvailable": 25
}
```

---

### Order Management

#### GET /admin/orders
Récupère toutes les commandes

**Query Parameters:**
- `status`: pending, confirmed, processing, shipped, delivered
- `paymentMethod`: orange_money, mtn_momo, cash
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `page`: Numéro de page
- `limit`: Résultats par page

#### GET /admin/orders/details/:id
Récupère les détails d'une commande par ID

#### PATCH /admin/orders/:id/status
Change le statut d'une commande

**Request Body:**
```json
{
  "status": "confirmed"
}
```

#### DELETE /admin/orders/:id
Supprime une commande

---

### Customers

#### GET /admin/customers
Récupère tous les clients

**Query Parameters:**
- `search`: Recherche par nom/téléphone
- `page`: Numéro de page
- `limit`: Résultats par page

#### GET /admin/customers/:id
Récupère les détails d'un client

#### GET /admin/customers/:id/orders
Récupère l'historique des commandes d'un client

---

### Statistics

#### GET /admin/stats/overview
Récupère les statistiques du dashboard

**Response:**
```json
{
  "success": true,
  "stats": {
    "revenueToday": 15000,
    "revenueThisWeek": 75000,
    "revenueThisMonth": 300000,
    "ordersToday": 5,
    "orderStats": {
      "pending": 2,
      "confirmed": 3,
      "processing": 1,
      "delivered": 10
    },
    "unreadNotifications": 3
  }
}
```

#### GET /admin/stats/revenue
Récupère les revenus des 7 derniers jours (pour graphique)

#### GET /admin/stats/orders
Récupère les statistiques des commandes

---

### Reviews Management

#### GET /admin/reviews/all
Récupère tous les avis (approuvés, en attente, rejetés)

**Query Parameters:**
- `status`: pending, approved, rejected
- `rating`: 1-5

#### PATCH /admin/reviews/:id/approve
Approuve un avis

#### PATCH /admin/reviews/:id/reject
Rejette un avis

#### DELETE /admin/reviews/:id
Supprime un avis

#### PATCH /admin/reviews/:id/pin
Épingle un avis en avant

---

### Notifications

#### GET /admin/notifications
Récupère les notifications

**Query Parameters:**
- `isRead`: true/false
- `page`: Numéro de page

#### PATCH /admin/notifications/:id/read
Marque une notification comme lue

#### DELETE /admin/notifications/:id
Supprime une notification

---

### Settings

#### GET /admin/settings
Récupère tous les paramètres

#### PUT /admin/settings
Modifie les paramètres

**Request Body:**
```json
{
  "businessInfo": {
    "name": "LunchUp",
    "phone": "+237 6 91 71 02 89",
    "email": "contact@lunchup.cm",
    "hours": "Lundi-Vendredi: 8H-15H"
  },
  "pricing": {
    "deliveryFee": 1500
  }
}
```

---

## 🔴 Codes d'Erreur

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié ou token expiré |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource inexistante |
| 429 | Too Many Requests | Rate limit dépassé |
| 500 | Internal Server Error | Erreur serveur |

---

## ✅ Exemples avec curl

### Login Admin
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lunchup.cm",
    "password": "SecurePassword123!"
  }'
```

### Créer une commande
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "Jean Kouam",
      "phone": "+237691710289"
    },
    "items": [{
      "menuItemId": "507f1f77bcf86cd799439011",
      "name": "Poulet DG",
      "price": 2500,
      "quantity": 1
    }],
    "payment": {"method": "cash"}
  }'
```

### Récupérer le menu
```bash
curl -X GET http://localhost:5000/api/menu/current
```

---

**Dernière mise à jour**: Janvier 2026
