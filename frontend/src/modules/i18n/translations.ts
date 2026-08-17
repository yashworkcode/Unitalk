export type Locale = 'English' | 'Spanish' | 'French'

export type TranslationStrings = {
  sidebar: {
    brand: string
    messages: string
    discover: string
    saved: string
    settings: string
    profile: string
    homeLabel: string
  }
  chatList: {
    inboxLabel: string
    messagesHeading: string
    searchPlaceholder: string
    all: string
    unread: string
    recent: string
    noConversationsFound: string
    noConversationsYet: string
    tryDifferentName: string
    startChatPrompt: string
    newConversation: string
    archivedConversations: string
  }
  chatWindow: {
    startHeading: string
    startText: string
    startButton: string
    translationLanguageTitle: string
    translationLanguageDescription: string
    translateToLabel: string
    bannerText: string
    beginningHeading: string
    beginningText: string
    composerPlaceholder: string
    storedNotice: string
  }
  newChatModal: {
    addByUsername: string
    startChat: string
    description: string
    usernameLabel: string
    translateLabel: string
    addFriendButton: string
  }
  settingsModal: {
    preferences: string
    settingsHeader: string
    generalTab: string
    languageTab: string
    notificationsTab: string
    privacyTab: string
    conversationPreferencesHeading: string
    conversationPreferencesText: string
    automaticTranslation: string
    automaticTranslationDescription: string
    showOriginalMessage: string
    showOriginalDescription: string
    appearance: string
    darkModeOn: string
    lightModeOn: string
    languagePreferencesHeading: string
    languagePreferencesText: string
    defaultTranslationLanguage: string
    defaultTranslationDescription: string
    appLanguage: string
    appLanguageDescription: string
    notificationSettingsHeading: string
    notificationSettingsText: string
    messageAlerts: string
    messageAlertsDescription: string
    friendRequestSound: string
    friendRequestDescription: string
    privacyControlsHeading: string
    privacyControlsText: string
    readReceipts: string
    readReceiptsDescription: string
    profileVisibility: string
    profileVisibilityDescription: string
  }
}

export type SidebarStrings = TranslationStrings['sidebar']
export type ChatListStrings = TranslationStrings['chatList']
export type ChatWindowStrings = TranslationStrings['chatWindow']
export type NewChatModalStrings = TranslationStrings['newChatModal']
export type SettingsModalStrings = TranslationStrings['settingsModal']

const common = {
  sidebar: {
    brand: 'unitalk',
    profile: 'Profile',
    homeLabel: 'UniTalk home',
  },
  chatList: {
    all: 'All',
    unread: 'Unread',
    recent: 'RECENT',
    noConversationsFound: 'No conversations found',
    noConversationsYet: 'No conversations yet',
    tryDifferentName: 'Try a different name or username.',
    startChatPrompt: 'Start a chat to send messages in any language.',
    newConversation: 'New conversation',
    archivedConversations: 'Archived conversations',
  },
}

export const translations: Record<Locale, TranslationStrings> = {
  English: {
    sidebar: {
      ...common.sidebar,
      messages: 'Messages',
      discover: 'Discover',
      saved: 'Saved',
      settings: 'Settings',
    },
    chatList: {
      ...common.chatList,
      inboxLabel: 'YOUR INBOX',
      messagesHeading: 'Messages',
      searchPlaceholder: 'Search conversations',
    },
    chatWindow: {
      startHeading: 'Start a meaningful conversation',
      startText: 'Send messages, photos, videos, and voice notes — with language controls built in.',
      startButton: 'Start a new chat',
      translationLanguageTitle: 'Translation language',
      translationLanguageDescription: 'New messages will be shown in this language.',
      translateToLabel: 'Translate to',
      bannerText: 'Auto-translate messages to',
      beginningHeading: 'This is the beginning of your conversation',
      beginningText: 'Say hello in any language. UniTalk will keep your preferred translation language ready.',
      composerPlaceholder: 'Message {name}…',
      storedNotice: 'Messages are stored in this browser ·',
    },
    newChatModal: {
      addByUsername: 'ADD BY USERNAME',
      startChat: 'Start a chat',
      description: 'Add a person using their UniTalk username. You can choose the language you want messages translated into.',
      usernameLabel: 'Username',
      translateLabel: 'Translate messages to',
      addFriendButton: 'Start chat',
    },
    settingsModal: {
      preferences: 'PREFERENCES',
      settingsHeader: 'Settings',
      generalTab: 'General',
      languageTab: 'Language',
      notificationsTab: 'Notifications',
      privacyTab: 'Privacy',
      conversationPreferencesHeading: 'Conversation preferences',
      conversationPreferencesText: 'Shape how UniTalk helps you understand every message.',
      automaticTranslation: 'Automatic translation',
      automaticTranslationDescription: 'Translate messages into English',
      showOriginalMessage: 'Show original message',
      showOriginalDescription: 'Display original below translations',
      appearance: 'Appearance',
      darkModeOn: 'Dark mode is on',
      lightModeOn: 'Light mode is on',
      languagePreferencesHeading: 'Language preferences',
      languagePreferencesText: 'Choose the default language UniTalk uses for message translation.',
      defaultTranslationLanguage: 'Default translation language',
      defaultTranslationDescription: 'Used when starting new conversations.',
      appLanguage: 'App language',
      appLanguageDescription: 'Set the interface language for UniTalk.',
      notificationSettingsHeading: 'Notification settings',
      notificationSettingsText: 'Control how UniTalk alerts you about new messages and activity.',
      messageAlerts: 'Message alerts',
      messageAlertsDescription: 'Receive alerts for new incoming messages.',
      friendRequestSound: 'Friend request sound',
      friendRequestDescription: 'Play a sound when someone sends a request.',
      privacyControlsHeading: 'Privacy controls',
      privacyControlsText: 'Choose who can see your activity and conversation status.',
      readReceipts: 'Read receipts',
      readReceiptsDescription: 'Let others know when you’ve read a message.',
      profileVisibility: 'Profile visibility',
      profileVisibilityDescription: 'Show your profile to people who discover you.',
    },
  },
  Spanish: {
    sidebar: {
      ...common.sidebar,
      messages: 'Mensajes',
      discover: 'Descubrir',
      saved: 'Guardado',
      settings: 'Ajustes',
    },
    chatList: {
      ...common.chatList,
      inboxLabel: 'TU BANDEJA',
      messagesHeading: 'Mensajes',
      searchPlaceholder: 'Buscar conversaciones',
    },
    chatWindow: {
      startHeading: 'Empieza una conversación significativa',
      startText: 'Envía mensajes, fotos, videos y notas de voz, con controles de idioma integrados.',
      startButton: 'Iniciar un nuevo chat',
      translationLanguageTitle: 'Idioma de traducción',
      translationLanguageDescription: 'Los nuevos mensajes se mostrarán en este idioma.',
      translateToLabel: 'Traducir a',
      bannerText: 'Traducir automáticamente mensajes a',
      beginningHeading: 'Este es el comienzo de tu conversación',
      beginningText: 'Di hola en cualquier idioma. UniTalk mantendrá tu idioma de traducción preferido listo.',
      composerPlaceholder: 'Mensaje a {name}…',
      storedNotice: 'Los mensajes se almacenan en este navegador ·',
    },
    newChatModal: {
      addByUsername: 'AÑADIR POR NOMBRE DE USUARIO',
      startChat: 'Inicia un chat',
      description: 'Agrega a una persona usando su nombre de usuario de UniTalk. Puedes elegir el idioma al que deseas traducir los mensajes.',
      usernameLabel: 'Nombre de usuario',
      translateLabel: 'Traducir mensajes a',
      addFriendButton: 'Iniciar chat',
    },
    settingsModal: {
      preferences: 'PREFERENCIAS',
      settingsHeader: 'Ajustes',
      generalTab: 'General',
      languageTab: 'Idioma',
      notificationsTab: 'Notificaciones',
      privacyTab: 'Privacidad',
      conversationPreferencesHeading: 'Preferencias de conversación',
      conversationPreferencesText: 'Define cómo UniTalk te ayuda a entender cada mensaje.',
      automaticTranslation: 'Traducción automática',
      automaticTranslationDescription: 'Traducir mensajes al inglés',
      showOriginalMessage: 'Mostrar mensaje original',
      showOriginalDescription: 'Mostrar el original debajo de las traducciones',
      appearance: 'Apariencia',
      darkModeOn: 'El modo oscuro está activado',
      lightModeOn: 'El modo claro está activado',
      languagePreferencesHeading: 'Preferencias de idioma',
      languagePreferencesText: 'Elige el idioma predeterminado que UniTalk usa para la traducción de mensajes.',
      defaultTranslationLanguage: 'Idioma de traducción predeterminado',
      defaultTranslationDescription: 'Usado al iniciar nuevas conversaciones.',
      appLanguage: 'Idioma de la aplicación',
      appLanguageDescription: 'Configura el idioma de la interfaz de UniTalk.',
      notificationSettingsHeading: 'Configuración de notificaciones',
      notificationSettingsText: 'Controla cómo UniTalk te alerta sobre nuevos mensajes y actividad.',
      messageAlerts: 'Alertas de mensajes',
      messageAlertsDescription: 'Recibir alertas de nuevos mensajes entrantes.',
      friendRequestSound: 'Sonido de solicitud de amistad',
      friendRequestDescription: 'Reproducir un sonido cuando alguien envía una solicitud.',
      privacyControlsHeading: 'Controles de privacidad',
      privacyControlsText: 'Elige quién puede ver tu actividad y estado de conversación.',
      readReceipts: 'Confirmaciones de lectura',
      readReceiptsDescription: 'Permite que otros sepan cuando has leído un mensaje.',
      profileVisibility: 'Visibilidad de perfil',
      profileVisibilityDescription: 'Muestra tu perfil a las personas que te descubran.',
    },
  },
  French: {
    sidebar: {
      ...common.sidebar,
      messages: 'Messages',
      discover: 'Découvrir',
      saved: 'Enregistré',
      settings: 'Paramètres',
    },
    chatList: {
      ...common.chatList,
      inboxLabel: 'VOTRE BOÎTE',
      messagesHeading: 'Messages',
      searchPlaceholder: 'Rechercher des conversations',
    },
    chatWindow: {
      startHeading: 'Commencez une conversation significative',
      startText: 'Envoyez des messages, photos, vidéos et notes vocales — avec des contrôles de langue intégrés.',
      startButton: 'Commencer une nouvelle discussion',
      translationLanguageTitle: 'Langue de traduction',
      translationLanguageDescription: 'Les nouveaux messages s’afficheront dans cette langue.',
      translateToLabel: 'Traduire en',
      bannerText: 'Traduire automatiquement les messages en',
      beginningHeading: 'Ceci est le début de votre conversation',
      beginningText: 'Dites bonjour dans n’importe quelle langue. UniTalk gardera votre langue de traduction préférée prête.',
      composerPlaceholder: 'Message à {name}…',
      storedNotice: 'Les messages sont stockés dans ce navigateur ·',
    },
    newChatModal: {
      addByUsername: 'AJOUTER PAR NOM D’UTILISATEUR',
      startChat: 'Commencer une discussion',
      description: 'Ajoutez une personne en utilisant son nom d’utilisateur UniTalk. Vous pouvez choisir la langue dans laquelle vous souhaitez traduire les messages.',
      usernameLabel: 'Nom d’utilisateur',
      translateLabel: 'Traduire les messages en',
      addFriendButton: 'Démarrer le chat',
    },
    settingsModal: {
      preferences: 'PRÉFÉRENCES',
      settingsHeader: 'Paramètres',
      generalTab: 'Général',
      languageTab: 'Langue',
      notificationsTab: 'Notifications',
      privacyTab: 'Confidentialité',
      conversationPreferencesHeading: 'Préférences de conversation',
      conversationPreferencesText: 'Définissez comment UniTalk vous aide à comprendre chaque message.',
      automaticTranslation: 'Traduction automatique',
      automaticTranslationDescription: 'Traduire les messages en anglais',
      showOriginalMessage: 'Afficher le message original',
      showOriginalDescription: 'Afficher l’original sous les traductions',
      appearance: 'Apparence',
      darkModeOn: 'Le mode sombre est activé',
      lightModeOn: 'Le mode clair est activé',
      languagePreferencesHeading: 'Préférences linguistiques',
      languagePreferencesText: 'Choisissez la langue par défaut qu’UniTalk utilise pour la traduction des messages.',
      defaultTranslationLanguage: 'Langue de traduction par défaut',
      defaultTranslationDescription: 'Utilisée lors du démarrage de nouvelles conversations.',
      appLanguage: 'Langue de l’application',
      appLanguageDescription: 'Définissez la langue de l’interface UniTalk.',
      notificationSettingsHeading: 'Paramètres de notification',
      notificationSettingsText: 'Contrôlez la manière dont UniTalk vous informe des nouveaux messages et de l’activité.',
      messageAlerts: 'Alertes de messages',
      messageAlertsDescription: 'Recevoir des alertes pour les nouveaux messages entrants.',
      friendRequestSound: 'Son de demande d’ami',
      friendRequestDescription: 'Jouez un son lorsque quelqu’un envoie une demande.',
      privacyControlsHeading: 'Contrôles de confidentialité',
      privacyControlsText: 'Choisissez qui peut voir votre activité et votre statut de conversation.',
      readReceipts: 'Accusés de lecture',
      readReceiptsDescription: 'Permettez aux autres de savoir lorsque vous avez lu un message.',
      profileVisibility: 'Visibilité du profil',
      profileVisibilityDescription: 'Affichez votre profil aux personnes qui vous découvrent.',
    },
  },
}
