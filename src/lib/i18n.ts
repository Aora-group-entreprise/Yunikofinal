// Complete i18n system for Yusheng v1
// All UI strings are keyed here - NO hardcoded text in components

export interface Language {
  code: string;
  label: string;
  flag: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦", rtl: true },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "mg", label: "Malagasy", flag: "🇲🇬" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
];

type TranslationKeys = keyof typeof EN;

const EN = {
  // Auth
  "auth.title": "Yusheng",
  "auth.subtitle": "Futuristic premium messaging",
  "auth.login": "Login",
  "auth.signup": "Sign up",
  "auth.pseudo": "Username",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.submit_login": "Sign in",
  "auth.submit_signup": "Create account",
  "auth.loading": "Loading...",
  "auth.pseudo_required": "Username required",
  "auth.email_invalid": "Invalid email",
  "auth.password_min": "6 characters minimum",
  "auth.success_login": "Logged in!",
  "auth.success_signup": "Account created!",

  // Bottom Nav
  "nav.inbox": "Inbox",
  "nav.friends": "Friends",
  "nav.rooms": "Rooms",
  "nav.notifs": "Notifs",
  "nav.profile": "Profile",

  // Inbox
  "inbox.title": "Messages",
  "inbox.conversations": "conversations",
  "inbox.search": "Search...",
  "inbox.empty": "No conversations. Add friends to start!",
  "inbox.no_results": "No results",

  // Friends
  "friends.title": "My friends",
  "friends.search_title": "Search",
  "friends.results": "results",
  "friends.count": "friends",
  "friends.search_placeholder": "Search a username...",
  "friends.added": "Friend added!",
  "friends.online": "Online",
  "friends.offline": "Offline",
  "friends.empty": "No friends. Search usernames!",
  "friends.no_results": "No user found",

  // Rooms
  "rooms.title": "🌍 Rooms",
  "rooms.subtitle": "Public chat rooms",
  "rooms.loading": "Loading rooms...",
  "rooms.public_room": "Public room",
  "rooms.first_message": "Be the first to write! ✨",
  "rooms.input_placeholder": "Write a message...",
  "rooms.send_error": "Send error",

  // Notifications
  "notifs.title": "🔔 Notifications",
  "notifs.unread": "unread",
  "notifs.all_read": "All read",
  "notifs.mark_all": "Mark all read",
  "notifs.empty": "No notifications 🔕",

  // Profile
  "profile.online": "● Online",
  "profile.user": "User",
  "profile.avatar_updated": "Avatar updated!",
  "profile.upload_error": "Upload error",
  "profile.signout": "Sign out",
  "profile.menu.notifications": "Notifications",
  "profile.menu.notifications_desc": "Manage alerts",
  "profile.menu.privacy": "Privacy",
  "profile.menu.privacy_desc": "Security settings",
  "profile.menu.appearance": "Appearance",
  "profile.menu.appearance_desc": "Theme and display",
  "profile.menu.language": "Language",
  "profile.menu.language_desc": "Change app language",
  "profile.menu.translation": "Translation",
  "profile.menu.translation_desc": "Auto-translate messages",
  "profile.menu.settings": "Settings",
  "profile.menu.settings_desc": "Advanced options",

  // Appearance
  "appearance.title": "🎨 Appearance",
  "appearance.theme": "Theme",
  "appearance.accent": "Accent color",
  "appearance.light": "Light",
  "appearance.light_desc": "Classic light theme",
  "appearance.dark": "Dark",
  "appearance.dark_desc": "Deep night theme",
  "appearance.futuristic": "Light Futuristic",
  "appearance.futuristic_desc": "Light with premium glow",
  "appearance.theme_updated": "Theme updated ✓",
  "appearance.accent_updated": "Accent updated ✓",
  "appearance.cyan": "Cyan",
  "appearance.purple": "Purple",
  "appearance.rose": "Rose",
  "appearance.emerald": "Emerald",
  "appearance.amber": "Amber",

  // Language
  "language.title": "🌍 Language",
  "language.updated": "Language updated ✓",
  "language.search": "Search a language...",

  // Translation
  "translation.title": "🌐 Translation",
  "translation.auto": "Auto-translate",
  "translation.auto_desc": "Translate messages automatically",
  "translation.target": "Target language",
  "translation.updated": "Translation settings updated ✓",
  "translation.view_original": "View original",

  // Notifications settings
  "notif_settings.title": "🔔 Notifications",
  "notif_settings.messages": "Messages",
  "notif_settings.messages_desc": "New message alerts",
  "notif_settings.likes": "Likes",
  "notif_settings.likes_desc": "Reaction alerts",
  "notif_settings.sounds": "Sounds",
  "notif_settings.sounds_desc": "Notification sounds",
  "notif_settings.vibration": "Vibration",
  "notif_settings.vibration_desc": "Haptic feedback",

  // Privacy
  "privacy.title": "🔒 Privacy",
  "privacy.visibility": "Profile visibility",
  "privacy.everyone": "Everyone",
  "privacy.friends_only": "Friends only",
  "privacy.nobody": "Nobody",
  "privacy.updated": "Privacy updated ✓",

  // Advanced
  "advanced.title": "⚙️ Advanced",
  "advanced.multi_accounts": "Multi-accounts",
  "advanced.multi_desc": "Sign out and create a new account",
  "advanced.signout_create": "Sign out & create",

  // Banner Ad
  "ad.text": "Yusheng Premium — Ad-free",

  // Feed
  "feed.title": "📰 Feed",
  "feed.subtitle": "Publications & news",
  "feed.publications": "Publications",
  "feed.create": "Create post",
  "feed.empty": "No publications yet. Be the first! ✨",
  "feed.posted": "Published! ✓",
  "feed.new_post": "New post",
  "feed.placeholder": "What's on your mind?",
  "feed.publish": "Publish",
  "feed.comments": "Comments",
  "feed.no_comments": "No comments yet",
  "feed.comment_placeholder": "Write a comment...",
  "feed.copied": "Copied!",
  "feed.just_now": "Just now",

  // Anonymous messages
  "anon.title": "🕵️ Anonymous",
  "anon.subtitle": "Secret messages",
  "anon.received": "Received",
  "anon.send": "Send",
  "anon.empty": "No anonymous messages yet 🔕",
  "anon.anonymous": "Anonymous",
  "anon.reply": "Reply",
  "anon.search_user": "Search a user...",
  "anon.sending_to": "Sending to",
  "anon.identity_hidden": "Your identity will be hidden",
  "anon.change": "Change",
  "anon.message_placeholder": "Write your anonymous message...",
  "anon.send_anonymous": "Send anonymously",
  "anon.sent": "Message sent anonymously! ✓",
  "anon.reply_anonymous": "Reply anonymously",
  "anon.reply_placeholder": "Write your reply...",
  "anon.send_reply": "Send reply",
  "anon.replied": "Reply sent! ✓",

  // Profile menu additions
  "profile.menu.feed": "Feed",
  "profile.menu.feed_desc": "Publications & news",
  "profile.menu.anonymous": "Anonymous",
  "profile.menu.anonymous_desc": "Secret messages",

  // Common
  "common.error": "Error",
  "common.save_error": "Save error",
};

const FR: Record<string, string> = {
  "auth.title": "Yusheng",
  "auth.subtitle": "Messagerie futuriste et premium",
  "auth.login": "Connexion",
  "auth.signup": "Inscription",
  "auth.pseudo": "Pseudo",
  "auth.email": "Email",
  "auth.password": "Mot de passe",
  "auth.submit_login": "Se connecter",
  "auth.submit_signup": "Créer un compte",
  "auth.loading": "Chargement...",
  "auth.pseudo_required": "Pseudo requis",
  "auth.email_invalid": "Email invalide",
  "auth.password_min": "6 caractères minimum",
  "auth.success_login": "Connecté !",
  "auth.success_signup": "Compte créé !",
  "nav.inbox": "Inbox",
  "nav.friends": "Amis",
  "nav.rooms": "Rooms",
  "nav.notifs": "Notifs",
  "nav.profile": "Profil",
  "inbox.title": "Messages",
  "inbox.conversations": "conversations",
  "inbox.search": "Rechercher...",
  "inbox.empty": "Aucune conversation. Ajoutez des amis pour commencer !",
  "inbox.no_results": "Aucun résultat",
  "friends.title": "Mes amis",
  "friends.search_title": "Recherche",
  "friends.results": "résultats",
  "friends.count": "amis",
  "friends.search_placeholder": "Rechercher un pseudo...",
  "friends.added": "Ami ajouté !",
  "friends.online": "En ligne",
  "friends.offline": "Hors ligne",
  "friends.empty": "Aucun ami. Recherchez des pseudos !",
  "friends.no_results": "Aucun utilisateur trouvé",
  "rooms.title": "🌍 Rooms",
  "rooms.subtitle": "Salons de discussion publics",
  "rooms.loading": "Chargement des salons...",
  "rooms.public_room": "Salon public",
  "rooms.first_message": "Soyez le premier à écrire ! ✨",
  "rooms.input_placeholder": "Écrire un message...",
  "rooms.send_error": "Erreur d'envoi",
  "notifs.title": "🔔 Notifications",
  "notifs.unread": "non lues",
  "notifs.all_read": "Tout est lu",
  "notifs.mark_all": "Tout lire",
  "notifs.empty": "Aucune notification pour le moment 🔕",
  "profile.online": "● En ligne",
  "profile.user": "Utilisateur",
  "profile.avatar_updated": "Avatar mis à jour !",
  "profile.upload_error": "Erreur d'upload",
  "profile.signout": "Se déconnecter",
  "profile.menu.notifications": "Notifications",
  "profile.menu.notifications_desc": "Gérer les alertes",
  "profile.menu.privacy": "Confidentialité",
  "profile.menu.privacy_desc": "Paramètres de sécurité",
  "profile.menu.appearance": "Apparence",
  "profile.menu.appearance_desc": "Thème et affichage",
  "profile.menu.language": "Langue",
  "profile.menu.language_desc": "Changer la langue de l'app",
  "profile.menu.translation": "Traduction",
  "profile.menu.translation_desc": "Traduction auto des messages",
  "profile.menu.settings": "Paramètres",
  "profile.menu.settings_desc": "Options avancées",
  "appearance.title": "🎨 Apparence",
  "appearance.theme": "Thème",
  "appearance.accent": "Couleur d'accent",
  "appearance.light": "Clair",
  "appearance.light_desc": "Thème lumineux classique",
  "appearance.dark": "Sombre",
  "appearance.dark_desc": "Thème nuit profond",
  "appearance.futuristic": "Light Futuriste",
  "appearance.futuristic_desc": "Clair avec glow premium",
  "appearance.theme_updated": "Thème mis à jour ✓",
  "appearance.accent_updated": "Accent mis à jour ✓",
  "appearance.cyan": "Cyan",
  "appearance.purple": "Violet",
  "appearance.rose": "Rose",
  "appearance.emerald": "Émeraude",
  "appearance.amber": "Ambre",
  "language.title": "🌍 Langue",
  "language.updated": "Langue mise à jour ✓",
  "language.search": "Rechercher une langue...",
  "translation.title": "🌐 Traduction",
  "translation.auto": "Traduction auto",
  "translation.auto_desc": "Traduire les messages automatiquement",
  "translation.target": "Langue cible",
  "translation.updated": "Paramètres de traduction mis à jour ✓",
  "translation.view_original": "Voir l'original",
  "notif_settings.title": "🔔 Notifications",
  "notif_settings.messages": "Messages",
  "notif_settings.messages_desc": "Alertes nouveaux messages",
  "notif_settings.likes": "Likes",
  "notif_settings.likes_desc": "Alertes réactions",
  "notif_settings.sounds": "Sons",
  "notif_settings.sounds_desc": "Sons de notification",
  "notif_settings.vibration": "Vibration",
  "notif_settings.vibration_desc": "Retour haptique",
  "privacy.title": "🔒 Confidentialité",
  "privacy.visibility": "Visibilité du profil",
  "privacy.everyone": "Tout le monde",
  "privacy.friends_only": "Amis uniquement",
  "privacy.nobody": "Personne",
  "privacy.updated": "Confidentialité mise à jour ✓",
  "advanced.title": "⚙️ Paramètres",
  "advanced.multi_accounts": "Multi-comptes",
  "advanced.multi_desc": "Se déconnecter et créer un nouveau compte",
  "advanced.signout_create": "Déconnexion & créer",
  "ad.text": "Yusheng Premium — Sans publicité",
  "feed.title": "📰 Feed",
  "feed.subtitle": "Publications & actualités",
  "feed.publications": "Publications",
  "feed.create": "Créer un post",
  "feed.empty": "Aucune publication. Soyez le premier ! ✨",
  "feed.posted": "Publié ! ✓",
  "feed.new_post": "Nouveau post",
  "feed.placeholder": "Quoi de neuf ?",
  "feed.publish": "Publier",
  "feed.comments": "Commentaires",
  "feed.no_comments": "Aucun commentaire",
  "feed.comment_placeholder": "Écrire un commentaire...",
  "feed.copied": "Copié !",
  "feed.just_now": "À l'instant",
  "anon.title": "🕵️ Anonyme",
  "anon.subtitle": "Messages secrets",
  "anon.received": "Reçus",
  "anon.send": "Envoyer",
  "anon.empty": "Aucun message anonyme 🔕",
  "anon.anonymous": "Anonyme",
  "anon.reply": "Répondre",
  "anon.search_user": "Chercher un utilisateur...",
  "anon.sending_to": "Envoi à",
  "anon.identity_hidden": "Votre identité sera cachée",
  "anon.change": "Changer",
  "anon.message_placeholder": "Écrivez votre message anonyme...",
  "anon.send_anonymous": "Envoyer anonymement",
  "anon.sent": "Message envoyé anonymement ! ✓",
  "anon.reply_anonymous": "Répondre anonymement",
  "anon.reply_placeholder": "Écrivez votre réponse...",
  "anon.send_reply": "Envoyer la réponse",
  "anon.replied": "Réponse envoyée ! ✓",
  "profile.menu.feed": "Feed",
  "profile.menu.feed_desc": "Publications & actualités",
  "profile.menu.anonymous": "Anonyme",
  "profile.menu.anonymous_desc": "Messages secrets",
  "common.error": "Erreur",
  "common.save_error": "Erreur lors de la sauvegarde",
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: EN,
  fr: FR,
};

let currentLang = "fr";

export function setLanguage(lang: string) {
  currentLang = lang;
  // Set RTL if needed
  const langDef = LANGUAGES.find(l => l.code === lang);
  document.documentElement.dir = langDef?.rtl ? "rtl" : "ltr";
}

export function getLanguage(): string {
  return currentLang;
}

export function t(key: string): string {
  const dict = TRANSLATIONS[currentLang];
  if (dict && dict[key]) return dict[key];
  // Fallback to English
  if (EN[key as TranslationKeys]) return EN[key as TranslationKeys];
  return key;
}
