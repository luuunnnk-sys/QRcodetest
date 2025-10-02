# 🚀 Comment lancer l'application

## ⚠️ IMPORTANT : Configuration de la base de données

Avant de pouvoir utiliser l'application, vous devez configurer la base de données Supabase.

### Étape 1 : Copier le script SQL

Ouvrez le fichier `SETUP_DATABASE.sql` qui se trouve à la racine du projet.

### Étape 2 : Exécuter le script dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **"SQL Editor"** dans le menu de gauche
4. Cliquez sur **"New query"**
5. **Copiez TOUT le contenu** du fichier `SETUP_DATABASE.sql`
6. **Collez-le** dans l'éditeur SQL
7. Cliquez sur **"Run"** (ou appuyez sur Cmd/Ctrl + Enter)
8. Attendez le message de succès ✅

### Étape 3 : Lancer l'application

L'application devrait déjà être en cours d'exécution !

Si ce n'est pas le cas, lancez :

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

## ✅ C'est tout !

Une fois la base de données configurée, vous verrez l'écran de création d'événement.

Suivez ensuite les instructions dans le fichier `GUIDE_DEMARRAGE.md` pour :
- Créer votre premier événement
- Importer des participants
- Générer des badges
- Scanner les QR codes

---

## 🆘 Si rien ne s'affiche

1. **Vérifiez que vous avez exécuté le script SQL dans Supabase**
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Vérifiez que le fichier `.env` contient bien vos clés Supabase
4. Redémarrez le serveur de développement (Ctrl+C puis `npm run dev`)

## 📱 Tester sur mobile

Pour tester le scanner QR sur votre téléphone :

1. Assurez-vous que votre ordinateur et votre téléphone sont sur le même réseau WiFi
2. Trouvez l'adresse IP locale de votre ordinateur
3. Accédez à `http://VOTRE_IP:5173` depuis votre téléphone
4. Autorisez l'accès à la caméra

Exemple : `http://192.168.1.10:5173`
