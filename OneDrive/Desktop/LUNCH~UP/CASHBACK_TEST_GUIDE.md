# 🧪 Guide de Test - Système de Cashback

## 📋 Préparation

### Prérequis
- Backend en cours d'exécution (port 5000)
- Frontend en cours d'exécution (port 5173)
- Base de données MongoDB connectée
- Compte administrateur créé

### Configuration
1. Via admin dashboard, définir le pourcentage de cashback (Settings > Loyauté)
2. S'assurer que la valeur par défaut est 5% si non configurée

---

## 🧪 Scénarios de test

### Test 1: Affichage du solde à la commande

**Étapes:**
1. Naviguer vers la page Checkout
2. Observer la section "Résumé"
3. Vérifier que le solde s'affiche en vert si > 0

**Résultat attendu:**
```
✓ Solde: 500 XAF (s'affiche)
✓ Case "Utiliser mon cashback" disponible
✓ Curseur désactivé jusqu'à activation
```

**Résultat si pas de solde:**
```
✓ Pas de section cashback affichée
✓ Total = prix normal
```

---

### Test 2: Utilisation des curseurs de cashback

**Étapes:**
1. Cocher la case "Utiliser mon cashback"
2. Observer que le curseur s'active
3. Ajuster le curseur vers la droite
4. Observer la mise à jour du montant

**Résultat attendu:**
```
✓ Curseur va de 0 à solde maximum
✓ Le montant s'affiche en temps réel
✓ Total se met à jour dynamiquement
   Nouveau total = total initial - montant appliqué

Exemple:
- Total avant: 5000 XAF
- Curseur à 500 XAF
- Total après: 4500 XAF

✓ Curseur retourne à 0 si case décochée
✓ Total revient à la valeur initiale
```

---

### Test 3: Déduction du cashback à la commande

**Étapes:**
1. Créer une commande avec cashback appliqué (50% du solde)
2. Soumettre le formulaire
3. Vérifier dans le backend que walletCashbackUsed est enregistré
4. Vérifier que le montant correct est facturé

**Résultat attendu:**
```
✓ Order.walletCashbackUsed = 250 (montant appliqué)
✓ Order.pricing.total = 4500 (réduit)
✓ Payment généré pour 4500 XAF, pas 5000

Vérification DB:
{
  "walletCashbackUsed": 250,
  "pricing": {
    "subtotal": 4000,
    "deliveryFee": 1000,
    "total": 4500  // 5000 - 250
  }
}
```

---

### Test 4: Génération du cashback à la livraison

**Prérequis:**
- Une commande passée (statut: pending)
- Cashback percentage = 5%

**Étapes:**
1. Via admin, simuler un changement de statut → "delivered"
2. Vérifier automatiquement que:
   - Order.cashbackAwarded = true
   - Customer.cashbackHistory a une nouvelle entrée "earned"
   - Customer.walletBalance augmente

**Résultat attendu:**
```
✓ Order.cashbackAwarded = true
✓ Order.status = "delivered"

Customer.cashbackHistory:
[
  {
    date: "2026-01-20T14:30:00Z",
    amount: 250,
    type: "earned",
    orderId: "507f...",
    description: "Cashback sur commande ORD-1234"
  }
]

✓ Customer.walletBalance augmenté de 250
```

---

### Test 5: Historique des transactions

**Étapes:**
1. Accéder à la page Cashback History
2. Observer les transactions listées
3. Vérifier les totaux (earned vs used)
4. Tester la pagiantion

**Résultat attendu:**
```
✓ Page affiche:
  - En-tête avec solde actuel (grande)
  - Statistiques: Total généré | Total utilisé
  - Liste des transactions triées par date DESC

✓ Chaque transaction:
  - 📈 Icon TrendingUp/Down selon type
  - Montant en XAF
  - Type (earned/used)
  - Date formatée
  - Description

✓ Pagination:
  - 10 éléments par page par défaut
  - Boutons précédent/suivant
  - Total de pages correct
```

---

### Test 6: Cas limites

#### Test 6a: Cashback > Total commande
**Étapes:**
1. Solde: 5000 XAF
2. Total commande: 2000 XAF
3. Essayer d'utiliser 5000 XAF

**Résultat attendu:**
```
✓ Curseur max = 2000 (limité au total)
✓ Impossible de dépasser le total
✓ Texte d'aide: "Max: 2000 XAF"
```

#### Test 6b: Cashback décimal
**Étapes:**
1. Total: 3333 XAF
2. Cashback 5% = 166.65 XAF

**Résultat attendu:**
```
✓ Arrondi correct
✓ Affichage formaté correctement
✓ Pas d'erreur de calcul
```

#### Test 6c: Plusieurs commandes
**Étapes:**
1. Commande 1: Total 2000 XAF → Cashback 100
2. Commande 2: Total 3000 XAF → Cashback 150
3. Utiliser 100 XAF sur commande 3
4. Commande 3 livrée: Génère 100 XAF

**Résultat attendu:**
```
✓ Historique:
  [earned] +100 (Cmd 1)
  [earned] +150 (Cmd 2)
  [used]   -100 (Cmd 3)
  [earned] +100 (Cmd 3 après livraison)

✓ Solde final: 100 + 150 - 100 + 100 = 250 ✓
```

---

### Test 7: API Endpoints

#### Test 7a: GET /admin/customers/wallet
```bash
curl -X GET http://localhost:5000/api/admin/customers/wallet \
  -H "Authorization: Bearer <token>"
```

**Résultat attendu:**
```json
{
  "success": true,
  "balance": 250,
  "currency": "XAF"
}
```

#### Test 7b: GET /admin/customers/cashback-history
```bash
curl -X GET http://localhost:5000/api/admin/customers/cashback-history?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

**Résultat attendu:**
```json
{
  "success": true,
  "history": [
    {
      "date": "2026-01-20T...",
      "amount": 250,
      "type": "earned",
      "orderId": "507f...",
      "description": "Cashback sur commande ORD-1234"
    }
  ],
  "total": {
    "earned": 500,
    "used": 100,
    "balance": 400
  }
}
```

#### Test 7c: POST /admin/customers/use-cashback (optionnel - normalement automatique)
```bash
curl -X POST http://localhost:5000/api/admin/customers/use-cashback \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "507f...", "amount": 50}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Cashback utilisé avec succès",
  "newBalance": 350
}
```

---

## 📊 Validation des données

### Vérifications en base de données

#### MongoDB - Collection Customers
```javascript
db.customers.findOne({ phone: "+237691710289" })
```

**Vérifier:**
```javascript
{
  "_id": ObjectId("..."),
  "phone": "+237691710289",
  "walletBalance": 250,
  "cashbackHistory": [
    {
      "date": ISODate("2026-01-20T14:30:00Z"),
      "amount": 250,
      "type": "earned",
      "orderId": ObjectId("507f..."),
      "description": "Cashback sur commande ORD-1234"
    }
  ],
  // ... autres champs
}
```

#### MongoDB - Collection Orders
```javascript
db.orders.findOne({ orderNumber: "ORD-1234" })
```

**Vérifier:**
```javascript
{
  "_id": ObjectId("..."),
  "orderNumber": "ORD-1234",
  "walletCashbackUsed": 250,
  "cashbackAwarded": true,
  "pricing": {
    "subtotal": 4000,
    "deliveryFee": 1000,
    "total": 4500
  },
  // ... autres champs
}
```

---

## 🔍 Debugging

### Problèmes courants

| Problème | Cause possible | Solution |
|----------|----------------|----------|
| Solde ne s'affiche pas | walletService non importé | Vérifier import walletService dans checkout.tsx |
| Curseur ne fonctionne pas | handleCashbackChange pas bindée | Vérifier événement onChange du slider |
| Total ne se met pas à jour | finalTotal pas recalculé | Vérifier useState de appliedCashback |
| Cashback non généré à livraison | Middleware order async | Vérifier updateOrderStatus dans orderController |
| API 404 sur wallet | Route non enregistrée | Vérifier customerRoutes.ts |

### Logs à vérifier

**Backend console:**
```
1. Création commande avec cashback:
   "Creating order with cashbackUsed: 250"
   
2. Récupération solde:
   "Fetching wallet for phone: +237691710289"
   
3. Changement statut:
   "Adding cashback: 250 to customer"
```

**Frontend console (DevTools):**
```
1. Chargement solde au montage:
   "Wallet balance loaded: 500"
   
2. Changement curseur:
   "Cashback amount changed: 250"
   
3. Submission formulaire:
   "Order created with walletCashbackUsed: 250"
```

---

## ✅ Checklist de validation finale

- [ ] Solde s'affiche à la commande
- [ ] Curseur fonctionne et respecte les limites
- [ ] Total se recalcule correctement
- [ ] Commande passée avec cashback appliqué
- [ ] Total en DB est réduit du cashback
- [ ] Cashback généré à la livraison
- [ ] Historique complet et exact
- [ ] API endpoints retournent bon format
- [ ] Cas limites gérés correctement
- [ ] Pas d'erreur en console (front + back)
- [ ] Pagination fonctionne
- [ ] Données en DB correctes

---

## 🚀 Prochaines étapes

Une fois tous les tests passés:
1. Documenter les résultats
2. Vérifier performance avec données volumineuses
3. Tester sur différents navigateurs
4. Faire des tests de stress (nombreuses commandes rapidement)
5. Valider avec les utilisateurs en test bêta

---

**Dernière mise à jour**: Janvier 2026
