# Guide de Démarrage - Check-in Manager

## 📋 Étape 1 : Configuration de la base de données

1. **Allez sur votre Dashboard Supabase** : https://supabase.com/dashboard
2. **Cliquez sur "SQL Editor"** dans la barre latérale gauche
3. **Copiez tout le contenu du fichier `SETUP_DATABASE.sql`**
4. **Collez-le dans l'éditeur SQL**
5. **Cliquez sur "Run"** pour exécuter le script

✅ Votre base de données est maintenant configurée !

## 🚀 Étape 2 : Lancer l'application

L'application est déjà en cours d'exécution. Si vous avez besoin de la relancer :

```bash
npm run dev
```

L'application sera accessible sur : http://localhost:5173

## 📱 Étape 3 : Utilisation

### Premier lancement

1. **Créez un événement**
   - Au premier lancement, vous verrez l'écran de création d'événement
   - Entrez le nom de votre événement (ex: "Conférence Tech 2025")
   - Ajoutez une description optionnelle
   - Cliquez sur "Créer l'événement"

### Importer des participants

2. **Préparez votre fichier CSV ou Excel**

Votre fichier doit contenir ces colonnes (les noms peuvent varier) :
- **Nom** (ou "last name", "lastname")
- **Prénom** (ou "prenom", "first name", "firstname")
- **Entreprise** (ou "company", "société", "societe") - optionnel

Exemple CSV :
```csv
Nom,Prénom,Entreprise
Dupont,Marie,Acme Corp
Martin,Jean,Tech Solutions
Bernard,Sophie,Innovation Lab
```

3. **Importez le fichier**
   - Sur l'écran d'accueil, cliquez sur "Importer CSV / Excel"
   - Sélectionnez votre fichier
   - Les participants sont automatiquement ajoutés avec leurs QR codes

### Générer les badges

4. **Téléchargez les badges**
   - Cliquez sur "Télécharger badges PDF"
   - Un PDF contenant tous les badges sera téléchargé
   - Imprimez-les et distribuez-les aux participants

### Scanner les QR codes

5. **Configurez le scanner**
   - Cliquez sur l'onglet "Scanner" en bas
   - Entrez votre nom (celui qui scanne)
   - Ajoutez votre email (optionnel)
   - Cliquez sur "Commencer le scan"

6. **Scannez les badges**
   - Autorisez l'accès à la caméra
   - Positionnez le QR code dans le cadre
   - Le système affichera :
     - ✅ **VERT** : Première entrée validée
     - 🟧 **ORANGE** : QR code déjà scanné (doublon)
     - ❌ **ROUGE** : QR code invalide ou inconnu

### Consulter l'historique

7. **Onglet Historique**
   - Voyez tous les check-ins en temps réel
   - Statistiques : Total, Valides, Doublons
   - Recherchez par nom ou entreprise
   - Les données se synchronisent automatiquement entre tous les appareils

## 📲 Installation sur mobile (PWA)

### iPhone
1. Ouvrez l'app dans Safari
2. Cliquez sur le bouton "Partager" (carré avec flèche)
3. Faites défiler et sélectionnez "Sur l'écran d'accueil"
4. Cliquez sur "Ajouter"

### Android
1. Ouvrez l'app dans Chrome
2. Cliquez sur le menu (3 points)
3. Sélectionnez "Installer l'application"
4. Confirmez l'installation

## 🔒 Sécurité

- Tous les QR codes sont signés cryptographiquement (HMAC)
- Impossible de falsifier un QR code
- Seuls les QR codes générés par votre système sont acceptés
- Les données sont stockées de manière sécurisée dans Supabase

## 💡 Astuces

- **Multi-appareils** : Plusieurs personnes peuvent scanner en même temps
- **Temps réel** : Les statistiques se mettent à jour instantanément
- **Offline** : L'app fonctionne même sans connexion (avec limitations)
- **Recherche** : Trouvez rapidement un participant dans l'historique

## 🆘 Problèmes courants

### "Erreur de variables d'environnement"
- Vérifiez que le fichier `.env` contient bien vos clés Supabase
- Redémarrez le serveur de développement

### "Impossible d'accéder à la caméra"
- Autorisez l'accès à la caméra dans les paramètres du navigateur
- Sur mobile, utilisez HTTPS ou localhost

### "QR code invalide"
- Vérifiez que le QR code a bien été généré par cette application
- Assurez-vous que la base de données contient le participant

## 📞 Support

Pour toute question, consultez la documentation Supabase ou React.
