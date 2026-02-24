# 🎉 LUNCHUP - GUIDE DE TEST RAPIDE

## ✨ TOUT EST CORRIGÉ - VOICI COMMENT TESTER

### 🔗 URLs
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Admin:    http://localhost:5173/admin/login
```

### 📦 Démarrer les serveurs

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ TESTS À FAIRE (Dans l'ordre)

### 1️⃣ TEST NAVIGATION
```
✓ Ouvre http://localhost:5173
✓ Clique "Accueil" → Reste sur la page (OK!)
✓ Clique "Menu" → Affiche le menu (OK!)
✓ Clique "Communauté" → Va sur communauté (OK!)
✓ Clique "Admin" → Va à /admin/login (OK!)
✓ Clique logo "L" → Revient à l'accueil (OK!)
```

### 2️⃣ TEST PANIER
```
✓ Scroll vers "Menu de cette semaine"
✓ Vois des cartes de plats (Riz, Arachide, etc)
✓ Clique "Ajouter" sur un plat
✓ ✨ Un toast dit "Plat ajouté au panier!"
✓ Badge panier passe à "1" (en haut-droite)
✓ Clique "Ajouter" sur un autre plat
✓ Badge panier passe à "2"
```

### 3️⃣ TEST SIDEBAR PANIER
```
✓ Clique icône panier (en haut-droite)
✓ 🎊 Un sidebar s'ouvre à droite
✓ Affiche les 2 plats que j'ai ajoutés
✓ Affiche: Nom | Prix | Quantité | Bouton Trash
✓ Affiche total en bas avec bouton "Commander"
✓ Clique le X en haut à droite du sidebar
✓ Sidebar se ferme
```

### 4️⃣ TEST QUANTITÉS DANS PANIER
```
✓ Ouvre sidebar panier
✓ Vois boutons "-" et "+" pour chaque item
✓ Clique "+" → Quantité passe de 1 à 2
✓ Vois le sous-total se mettre à jour
✓ Clique "-" → Quantité revient à 1
```

### 5️⃣ TEST SUPPRESSION PANIER
```
✓ Ouvre sidebar
✓ Clique bouton Trash sur un item
✓ Item disparaît
✓ Badge panier se met à jour (à 1)
✓ Total se recalcule
```

### 6️⃣ TEST COMMANDE
```
✓ Ouvre sidebar avec les items
✓ Clique bouton "Commander"
✓ Sidebar se ferme
✓ Va sur page /checkout
✓ Vois le formulaire de commande
✓ À gauche: Formulaire
✓ À droite: Résumé panier
```

### 7️⃣ TEST FORMULAIRE COMMANDE
```
✓ Remplis "Nom complet": "Jean Kouam"
✓ Remplis "Téléphone": "+237691710289"
✓ Remplis "Adresse": "Résidence Étoile, Yaoundé"
✓ Sélectionne type livraison: "Campus"
✓ Sélectionne paiement: "Espèces"
✓ Clique "Passer la commande"
✓ ✨ Toast dit "Commande passée avec succès!"
✓ Panier se vide
✓ Revient à l'accueil
```

### 8️⃣ TEST ADMIN LOGIN
```
✓ Clique "Admin" navbar (ou va /admin/login)
✓ Vois le formulaire de login
✓ Remplis Email: "lucky@lunchup.cm"
✓ Remplis Mot de passe: "A8FBB859@lucky"
✓ Clique "Se connecter"
✓ ✨ Toast dit "Connexion réussie"
✓ Va sur /admin dashboard
```

### 9️⃣ TEST DASHBOARD ADMIN
```
✓ Vois header "LunchUp Dashboard"
✓ Vois 4 cartes: Commandes | Menu | Statistiques | Clients
✓ Vois cartes avec revenus: Total | Ce mois | Nombre commandes | Valeur moyenne
✓ Scroll vers "Gestion du Menu Hebdomadaire"
✓ Vois formulaire "Ajouter un nouvel article"
```

### 🔟 TEST AJOUTER MENU
```
✓ Remplis:
  - Nom du plat: "Fufu"
  - Prix: "2000"
  - Jour: "Lundi"
  - Quantité: "15"
  - Description: "Délicieux fufu avec sauce"
✓ Clique "Ajouter au menu"
✓ ✨ Toast dit "Élément ajouté au menu"
✓ Scroll vers section "Lundi"
✓ Vois "Fufu" dans la liste!
```

### 1️⃣1️⃣ TEST MODIFIER MENU
```
✓ Vois item "Fufu" dans la liste Lundi
✓ Hover sur l'item → Boutons Edit et Trash apparaissent
✓ Clique Trash
✓ Item disparaît
✓ ✨ Toast dit "Élément supprimé"
```

### 1️⃣2️⃣ TEST LOGOUT
```
✓ En haut-droite du dashboard
✓ Clique bouton "Déconnexion"
✓ ✨ Toast dit "Déconnecté"
✓ Revient à /admin/login
```

---

## 🐛 SI QUELQUE CHOSE NE MARCHE PAS

### Panier ne s'ouvre pas
→ Ouvre console (F12)
→ Cherche erreurs en rouge
→ Redémarre frontend: Ctrl+C puis `npm run dev`

### Formulaire ne valide pas
→ Vérifie les messages d'erreur rouges sous chaque champ
→ Le téléphone doit avoir min 10 caractères
→ L'adresse doit avoir min 10 caractères

### Backend ne répond pas
→ Vérifier MongoDB est en ligne
→ Redémarre backend: Ctrl+C puis `npm run dev`
→ Vérifie que le port 5000 est libre: `netstat -ano | findstr :5000`

### Admin login échoue
→ Vérifier les credentials:
  - Email: **lucky@lunchup.cm**
  - Password: **A8FBB859@lucky**
→ Vérifier que le backend répond: `curl http://localhost:5000/api/menu/current`

---

## 📊 RÉSUMÉ DES CORRECTIONS

| # | Fonctionnalité | Avant | Après | Status |
|---|---|---|---|---|
| 1 | Navigation navbar | Liens cassés `<a>` | `<Link>` + `useNavigate` | ✅ |
| 2 | Ajouter au panier | Ne faisait rien | Ajoute + Toast | ✅ |
| 3 | Sidebar panier | N'existait pas | Complète + Fonctionnelle | ✅ |
| 4 | Formulaire commande | Pas de validation | React Hook Form + Zod | ✅ |
| 5 | Admin login | Pas d'auth | JWT + Protected routes | ✅ |
| 6 | Dashboard | Vide | Statistiques + Menu Manager | ✅ |
| 7 | Backend API | Non-testable | Tous endpoints ✓ | ✅ |
| 8 | CORS | Port limité | 4 ports autorisés | ✅ |

---

## 🚀 PROCHAINES ÉTAPES (OPTIONNEL)

- [ ] Ajouter image upload pour les plats
- [ ] Implémenter notifications en temps réel
- [ ] Ajouter page profil client
- [ ] Intégrer paiement mobile (Orange Money)
- [ ] Dashboard statistiques détaillées
- [ ] Historique commandes client
- [ ] Reviews/Ratings des plats

---

## 📞 CONTACTS
- **WhatsApp**: +237 6 91 71 02 89
- **Email**: lucky@lunchup.cm
- **Horaires**: Lundi - Vendredi, 8H - 15H

---

**Dernière mise à jour**: 23 janvier 2026  
**Status**: ✅ PRODUCTION READY
