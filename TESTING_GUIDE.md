# 🧪 Guide de Test des APIs Backend

## ✅ Données de Test Créées

Le script de seed a créé les données suivantes dans la base de données :

### 👥 Utilisateurs (3)
- **Admin**: `admin@example.com` / `AdminPass123!`
- **Maintenance**: `maintenance@example.com` / `AdminPass123!`
- **Technicien**: `technicien@example.com` / `AdminPass123!`

### 📦 Catégories (3)
- SON (Audio)
- VIDEO (Vidéo)
- LUMIERE (Éclairage)

### 📋 Sous-catégories (15)
- SON: Microphones, Enceintes, Tables de mixage, Amplificateurs, Câbles audio
- VIDEO: Projecteurs, Écrans, Caméras, Mélangeurs vidéo, Câbles vidéo
- LUMIERE: Projecteurs LED, Lyres, Stroboscopes, Consoles DMX, Câbles DMX

### 🎛️ Matériel (8 équipements)
- Microphone Sans Fil Shure SM58
- Enceinte Active JBL PRX815W
- Table de Mixage Behringer X32
- Vidéoprojecteur Epson EB-X41
- Écran de Projection 3x4m
- Caméra Canon XA50
- Projecteur LED RGB 50W
- Console DMX GrandMA2

### 📅 Événements (3)
- Concert Rock Festival (PLANIFIE)
- Conférence Entreprise (PLANIFIE)
- Mariage Premium (EN_COURS)

### 🚚 Véhicules (3)
- Camion Mercedes Sprinter (DISPONIBLE)
- Utilitaire Renault Master (DISPONIBLE)
- Voiture Peugeot Partner (EN_SERVICE)

---

## 🚀 Comment Tester les APIs

### Étape 1: Démarrer le Serveur Backend

```bash
cd Events_backend
npm run dev
```

Le serveur démarrera sur `http://localhost:3000`

### Étape 2: Exécuter les Tests Automatiques

Dans un **nouveau terminal** :

```bash
cd Events_backend
npm run test-apis
```

Ce script testera automatiquement **26 endpoints** :
- ✅ Health Check
- ✅ Authentification (Login, Me)
- ✅ Catégories
- ✅ Matériel (CRUD, recherche, filtres)
- ✅ Événements
- ✅ Maintenances
- ✅ Véhicules & Transports
- ✅ Utilisateurs
- ✅ WhatsApp
- ✅ Activity Logs

---

## 📝 Tests Manuels avec cURL

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Login (Obtenir le Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }'
```

**Copiez le `access_token` de la réponse**

### 3. Obtenir les Catégories
```bash
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

### 4. Obtenir le Matériel
```bash
curl http://localhost:3000/api/equipment \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

### 5. Obtenir les Événements
```bash
curl http://localhost:3000/api/events \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

### 6. Obtenir les Véhicules
```bash
curl http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

---

## 🔧 Scripts Disponibles

### Seed Database (Ajouter des données de test)
```bash
npm run seed
```

### Test Toutes les APIs
```bash
npm run test-apis
```

### Démarrer le Serveur
```bash
npm run dev
```

---

## 📊 Résultats Attendus

Après avoir démarré le serveur et exécuté `npm run test-apis`, vous devriez voir :

```
✅ Health Check - SUCCESS
✅ Database Check - SUCCESS
✅ Login - Admin - SUCCESS
✅ Get Current User (Me) - SUCCESS
✅ Get All Categories - SUCCESS
✅ Get Category by ID - SUCCESS
✅ Get All Equipment - SUCCESS
... (et ainsi de suite)

📊 TEST SUMMARY
Total Tests: 26
✅ Passed: 26
❌ Failed: 0
Success Rate: 100.0%
```

---

## 🐛 Dépannage

### Erreur: "connect ECONNREFUSED"
➡️ Le serveur backend n'est pas démarré. Lancez `npm run dev` dans le dossier `Events_backend`.

### Erreur: "Database connection failed"
➡️ Vérifiez que PostgreSQL est démarré et que les variables d'environnement dans `.env` sont correctes.

### Erreur: "No category ID available"
➡️ Les données n'ont pas été créées. Exécutez `npm run seed` pour créer les données de test.

---

## 📚 Documentation API Complète

Consultez les fichiers dans `Events_backend/docs/` pour la documentation complète de chaque module :
- `API_AUTH.md` - Authentification
- `API_CATEGORIES.md` - Catégories
- `API_EQUIPMENT.md` - Matériel
- `API_EVENTS.md` - Événements
- `API_MAINTENANCE.md` - Maintenance
- `API_VEHICLES_TRANSPORT.md` - Véhicules & Transport
- `API_WHATSAPP.md` - WhatsApp

---

**✨ Bon test !**
