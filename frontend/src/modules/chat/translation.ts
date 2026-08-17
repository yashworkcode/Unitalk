const phraseTranslations: Record<string, Record<string, string>> = {
  Spanish: {
    'hello': 'hola',
    'how are you': '¿cómo estás?',
    'good morning': 'buenos días',
    'good evening': 'buenas noches',
    'thank you': 'gracias',
    'see you': 'nos vemos',
    'start a conversation': 'inicia una conversación',
    'message': 'mensaje',
    'voice message': 'mensaje de voz',
    'image': 'imagen',
    'video': 'video',
    'translate messages to': 'traducir mensajes a',
  },
  French: {
    'hello': 'bonjour',
    'how are you': 'comment ça va',
    'good morning': 'bonjour',
    'good evening': 'bonsoir',
    'thank you': 'merci',
    'see you': 'à bientôt',
    'start a conversation': 'commencez une conversation',
    'message': 'message',
    'voice message': 'message vocal',
    'image': 'image',
    'video': 'vidéo',
    'translate messages to': 'traduire les messages en',
  },
  Hindi: {
    'hello': 'नमस्ते',
    'how are you': 'कैसे हैं आप',
    'good morning': 'सुप्रभात',
    'good evening': 'शुभ संध्या',
    'thank you': 'धन्यवाद',
    'see you': 'फ़िर मिलेंगे',
    'start a conversation': 'एक बातचीत शुरू करें',
    'message': 'संदेश',
    'voice message': 'वॉयस संदेश',
    'image': 'छवि',
    'video': 'वीडियो',
    'translate messages to': 'संदेशों का अनुवाद करें',
  },
  Portuguese: {
    'hello': 'olá',
    'how are you': 'como vai você',
    'good morning': 'bom dia',
    'good evening': 'boa noite',
    'thank you': 'obrigado',
    'see you': 'até logo',
    'start a conversation': 'inicie uma conversa',
    'message': 'mensagem',
    'voice message': 'mensagem de voz',
    'image': 'imagem',
    'video': 'vídeo',
    'translate messages to': 'traduzir mensagens para',
  },
  Japanese: {
    'hello': 'こんにちは',
    'how are you': 'お元気ですか',
    'good morning': 'おはようございます',
    'good evening': 'こんばんは',
    'thank you': 'ありがとうございます',
    'see you': 'またね',
    'start a conversation': '会話を始めましょう',
    'message': 'メッセージ',
    'voice message': '音声メッセージ',
    'image': '画像',
    'video': '動画',
    'translate messages to': 'メッセージを翻訳する',
  },
  Arabic: {
    'hello': 'مرحبا',
    'how are you': 'كيف حالك',
    'good morning': 'صباح الخير',
    'good evening': 'مساء الخير',
    'thank you': 'شكرا',
    'see you': 'أراك لاحقاً',
    'start a conversation': 'ابدأ محادثة',
    'message': 'رسالة',
    'voice message': 'رسالة صوتية',
    'image': 'صورة',
    'video': 'فيديو',
    'translate messages to': 'ترجم الرسائل إلى',
  },
  German: {
    'hello': 'hallo',
    'how are you': 'wie geht es dir',
    'good morning': 'guten morgen',
    'good evening': 'guten abend',
    'thank you': 'danke',
    'see you': 'bis später',
    'start a conversation': 'beginne ein gespräch',
    'message': 'nachricht',
    'voice message': 'sprachnachricht',
    'image': 'bild',
    'video': 'video',
    'translate messages to': 'übersetze nachrichten in',
  },
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function translatePhrase(text: string, language: string): string {
  const translations = phraseTranslations[language as keyof typeof phraseTranslations]
  if (!translations) return text

  let translated = text
  const phrases = Object.keys(translations).sort((a, b) => b.length - a.length)
  for (const phrase of phrases) {
    const translation = translations[phrase]
    translated = translated.replace(new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi'), match => {
      return match[0] === match[0].toUpperCase()
        ? translation.charAt(0).toUpperCase() + translation.slice(1)
        : translation
    })
  }
  return translated
}

export function translateText(text: string, language: string) {
  if (language === 'English' || !text.trim()) return text
  const translated = translatePhrase(text, language)
  return translated === text ? `${text} [${language}]` : translated
}
