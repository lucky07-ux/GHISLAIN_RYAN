# 💰 Système de Cashback LunchUp

## 📌 Vue d'ensemble

Le système de cashback permet aux clients de LunchUp d'accumuler des crédits à chaque commande et de les réutiliser pour réduire le coût de futures commandes.

### Fonctionnalités principales
- ✅ Accumulation automatique de cashback sur chaque commande livrée
- ✅ Stockage du cashback dans le portefeuille de l'utilisateur
- ✅ Utilisation flexible du cashback à la commande
- ✅ Historique complet des transactions
- ✅ Gestion depuis le dashboard admin

---

## 🔄 Flux de travail

### 1️⃣ Accumulation de cashback

Le cashback est **automatiquement généré** lorsqu'une commande est marquée comme **"livrée"**.

**Formule:**
```
Cashback = Prix total de la commande × (Pourcentage configuré / 100)
```

**Exemple:**
- Total commande: 5000 XAF
- Pourcentage cashback: 5%
- Cashback aupatriel: 250 XAF

**Configuration:**
Le pourcentage est configurable via l'admin dashboard dans les paramètres de loyauté:
- `Settings.loyalty.cashbackPercentage` (défaut: 5%)

### 2️⃣ Utilisation du cashback

Les clients peuvent utiliser leur cashback lors du paiement d'une nouvelle commande.

**Processus:**
1. Client accède au panier/checkout
2. Son solde cashback s'affiche automatiquement
3. Client active la case "Utiliser mon cashback"
4. Client ajuste le montant via un curseur (0 à solde maximum)
5. Le total est mis à jour automatiquement
6. La commande est passée avec la déduction appliquée

**Limitation:**
- Le cashback ne peut pas dépasser le total de la commande
- Le cashback ne peut pas être négatif
- L'application déclare le solde exact pour éviter les erreurs

### 3️⃣ Historique des transactions

Chaque transaction de cashback est enregistrée avec:
- 📅 Date et heure exacte
- 💵 Montant
- 🏷️ Type (`earned` ou `used`)
- 📋 Référence de la commande
- 💬 Description

---

## 💻 Architecture technique

### Backend

#### Modèle Customer
```typescript
interface ICustomer extends Document {
  // ... autres champs
  walletBalance: number;        // Solde en XAF
  cashbackHistory: [{
    date: Date;
    amount: number;
    type: 'earned' | 'used';
    orderId?: ObjectId;
    description: string;
  }];
  
  // Méthodes
  addCashback(amount: number, orderId?: ObjectId): void;
  useCashback(amount: number, orderId?: ObjectId): void;
}
```

#### Modèle Order
```typescript
interface IOrderDoc extends Document {
  // ... autres champs
  walletCashbackUsed?: number;  // Montant utilisé pour cette commande
  cashbackAwarded: boolean;      // Indique si cashback a été généré
}
```

#### Endpoints API

**GET /admin/customers/wallet**
- Récupère le solde actuel du portefeuille
- Nécessite: authentification + role 'user'

**GET /admin/customers/cashback-history**
- Retourne l'historique paginé des transactions
- Nécessite: authentification + role 'user'

**POST /admin/customers/use-cashback**
- Valide et applique l'utilisation du cashback
- Nécessite: authentification + role 'user'

**CREATE ORDER avec walletCashbackUsed**
- Lors de la création de commande, le cashback est déduit du total
- Le solde du client est mis à jour

### Frontend

#### Services
```typescript
// walletService.ts
export const walletService = {
  getWalletBalance(): Promise<{ balance: number | 0 }>;
  getCashbackHistory(page?: number, limit?: number): Promise<HistoryData>;
  useCashback(amount: number, orderId: string): Promise<{ success: boolean; newBalance: number }>;
};
```

#### Composants
- **Checkout.tsx**: Affiche le solde, permet d'activer/ajuster le cashback
- **CashbackHistory.tsx**: Affiche l'historique complet avec statistiques

#### État
- Gestion locale du cashback utilisé au checkout
- Chargement automatique du solde au montage du composant
- Mise à jour en temps réel de l'affichage

---

## 🧮 Exemples

### Exemple 1: Accumulation
```
Commande 1:
- Total: 5000 XAF
- Marquée comme livrée
- Cashback généré: 5000 × 5% = 250 XAF
- Nouveau solde: 250 XAF

Commande 2:
- Total: 3000 XAF
- Marquée comme livrée
- Cashback généré: 3000 × 5% = 150 XAF
- Nouveau solde: 250 + 150 = 400 XAF
```

### Exemple 2: Utilisation
```
Commande 3:
- Solde client: 400 XAF
- Total commande: 2000 XAF
- Client utilise: 400 XAF (tout le solde)
- Total final: 2000 - 400 = 1600 XAF
- Nouveau solde: 0 XAF

Commande 4:
- Solde client: 0 XAF
- Bouton cashback désactivé
```

### Exemple 3: Utilisation partielle
```
Commande 5:
- Solde client: 1000 XAF
- Total commande: 5000 XAF
- Client utilise: 500 XAF (via curseur)
- Total final: 5000 - 500 = 4500 XAF
- Nouveau solde: 1000 - 500 = 500 XAF

Commande 6:
- Solde client: 500 XAF
- Cashback généré: 4500 × 5% = 225 XAF
- Nouveau solde: 500 + 225 = 725 XAF
```

---

## ⚙️ Configuration

### Dans les paramètres Admin

```json
{
  "loyalty": {
    "cashbackPercentage": 5,
    "minOrderForCashback": 0,
    "maxCashbackPerOrder": null
  }
}
```

### Variables d'environnement (si applicable)
```env
CASHBACK_PERCENTAGE=5
CASHBACK_ENABLED=true
```

---

## 🚨 Gestion des erreurs

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Solde insuffisant" | Cashback utilisé > solde disponible | Réduire le montant utilisé |
| "Client non trouvé" | Numéro téléphone invalide | Corriger les infos client |
| "Commande non trouvée" | ID de commande invalide | Vérifier le numéro de commande |

### Validation côté frontend
- Vérifier solde > 0 avant d'afficher le curseur
- Limiter dynamiquement la plage du curseur
- Désactiver le bouton de commande si données invalides

### Validation côté backend
- Vérifier format du montant (number, positif)
- Vérifier solde suffisant
- Vérifier validité de la commande
- Enregistrement atomique de la transaction

---

## 📊 Monitoring

### Métriques importantes
- Total cashback accordé par jour/mois
- Total cashback utilisé par jour/mois
- Moyenne cashback par commande
- Distribution des utilisateurs par solde

### Audit trail
- Chaque transaction est enregistrée avec timestamp
- Lien bidirectionnel entre Customer et Order
- Possible de rejeter/reverser des transactions

---

## 🔐 Sécurité

### Principes appliqués
- ✅ Vérification du solde avant chaque utilisation
- ✅ Authentification requise pour tous les endpoints
- ✅ Validation des montants (positifs, nombres entiers)
- ✅ Audit trail complet
- ✅ Transactions atomiques (MongoDB)

### Prévention de fraude
- Impossible de dépasser le solde disponible
- Impossible de générer du cashback fictif
- Impossible de modifier l'historique rétroactivement
- IP/Session peut être loggée si nécessaire

---

## 🚀 Fonctionnalités futures

- [ ] Programme de parrainage (bonus cashback pour référral)
- [ ] Bonus d'anniversaire (cashback extra le jour de l'anniversaire)
- [ ] Niveaux VIP (% différents selon le tier)
- [ ] Conversion du cashback en points (rédemption)
- [ ] Notifications push lors de récompense
- [ ] Expiration du cashback après X jours (optionnel)
- [ ] Statistiques détaillées dans le dashboard user

---

## 📞 Support

Pour toute question ou problème:
- Consulter l'API_DOCUMENTATION.md
- Vérifier les logs du serveur
- Tester les endpoints manuellement avec curl
- Vérifier l'état du cashback dans le dashboard admin

---

**Dernière mise à jour**: Janvier 2026
