import axios from 'axios'
import { franc } from 'franc-min'

// Maps the language *names* the frontend uses (see src/modules/chat/ChatWindow.tsx
// `languages` array) to ISO-639-1 codes understood by translation providers.
const LANGUAGE_CODES = {
  English: 'en',
  Hindi: 'hi',
  Spanish: 'es',
  Portuguese: 'pt',
  French: 'fr',
  Japanese: 'ja',
  Arabic: 'ar',
  German: 'de',
}
const NAME_BY_CODE = Object.fromEntries(Object.entries(LANGUAGE_CODES).map(([name, code]) => [code, name]))

// franc-min returns ISO-639-3 codes ("spa", "eng"...) - map the ones we care
// about to our ISO-639-1 codes above. Used only for the fully-offline path;
// the live providers (google-free / libretranslate) detect the source
// language themselves and are far more accurate, especially on short text.
const FRANC_TO_ISO1 = { eng: 'en', hin: 'hi', spa: 'es', por: 'pt', fra: 'fr', jpn: 'ja', arb: 'ar', deu: 'de' }

// Small offline phrase dictionary used when TRANSLATION_PROVIDER=none, or as
// a last-resort fallback if a live provider is unreachable. Keyed by
// English phrase -> translation, with an auto-generated reverse map so a
// message can also be translated back OUT of that language into English
// (or pivoted through English into a third language) without a network call.
const PHRASE_FALLBACK = {
  Spanish: { hello: 'hola', 'thank you': 'gracias', 'how are you': '¿cómo estás?', 'good morning': 'buenos días', 'good evening': 'buenas noches', 'see you': 'nos vemos', 'i love you': 'te amo' },
  French: { hello: 'bonjour', 'thank you': 'merci', 'how are you': 'comment ça va', 'good morning': 'bonjour', 'good evening': 'bonsoir', 'see you': 'à bientôt', 'i love you': "je t'aime" },
  Hindi: { hello: 'नमस्ते', 'thank you': 'धन्यवाद', 'how are you': 'कैसे हैं आप', 'good morning': 'सुप्रभात', 'good evening': 'शुभ संध्या', 'see you': 'फ़िर मिलेंगे', 'i love you': 'मैं तुमसे प्यार करता हूँ' },
  Portuguese: { hello: 'olá', 'thank you': 'obrigado', 'how are you': 'como vai você', 'good morning': 'bom dia', 'good evening': 'boa noite', 'see you': 'até logo', 'i love you': 'eu te amo' },
  Japanese: { hello: 'こんにちは', 'thank you': 'ありがとうございます', 'how are you': 'お元気ですか', 'good morning': 'おはようございます', 'good evening': 'こんばんは', 'see you': 'またね', 'i love you': '愛してる' },
  Arabic: { hello: 'مرحبا', 'thank you': 'شكرا', 'how are you': 'كيف حالك', 'good morning': 'صباح الخير', 'good evening': 'مساء الخير', 'see you': 'أراك لاحقاً', 'i love you': 'أحبك' },
  German: { hello: 'hallo', 'thank you': 'danke', 'how are you': 'wie geht es dir', 'good morning': 'guten morgen', 'good evening': 'guten abend', 'see you': 'bis später', 'i love you': 'ich liebe dich' },
}
const REVERSE_PHRASE_FALLBACK = Object.fromEntries(
  Object.entries(PHRASE_FALLBACK).map(([language, dict]) => [language, Object.fromEntries(Object.entries(dict).map(([english, translation]) => [translation.toLowerCase(), english]))])
)

// Tiny in-memory cache so identical strings translated repeatedly (common in
// chat - "hello", "ok", "thanks"...) don't hit the network every time.
const cache = new Map()
const CACHE_LIMIT = 5000
function cacheKey(text, targetLang) {
  return `${targetLang}::${text}`
}
function rememberInCache(key, value) {
  if (cache.size >= CACHE_LIMIT) cache.clear()
  cache.set(key, value)
}

function replacePhrases(text, dict) {
  let result = text
  for (const [phrase, translation] of Object.entries(dict).sort((a, b) => b[0].length - a[0].length)) {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    result = result.replace(re, match => (match[0] === match[0].toUpperCase() ? translation.charAt(0).toUpperCase() + translation.slice(1) : translation))
  }
  return result
}

/** Best-effort offline language detection. Returns an ISO-639-1 code from our
 * supported set, or null if undetermined / not one we recognize. Short chat
 * messages are inherently ambiguous for statistical detectors (e.g. "te amo"
 * reads as valid Spanish or Portuguese) - this is a fallback, not the primary
 * detection path, which is why the live providers below are preferred. */
function detectLanguageOffline(text) {
  const guess = franc(text, { minLength: 1 })
  return FRANC_TO_ISO1[guess] || null
}

function translateOffline(text, targetLanguage) {
  const detectedCode = detectLanguageOffline(text)
  const detectedLanguage = detectedCode ? NAME_BY_CODE[detectedCode] : null

  if (detectedLanguage === targetLanguage) return { translated: text, detectedCode }

  if (!detectedLanguage || detectedLanguage === 'English') {
    // Treat as English source -> translate forward into the target language.
    return { translated: replacePhrases(text, PHRASE_FALLBACK[targetLanguage] || {}), detectedCode: detectedCode || 'en' }
  }
  if (targetLanguage === 'English') {
    // Translate the detected language back out into English.
    return { translated: replacePhrases(text, REVERSE_PHRASE_FALLBACK[detectedLanguage] || {}), detectedCode }
  }
  // Neither side is English - pivot through it: detectedLanguage -> English -> targetLanguage.
  const viaEnglish = replacePhrases(text, REVERSE_PHRASE_FALLBACK[detectedLanguage] || {})
  return { translated: replacePhrases(viaEnglish, PHRASE_FALLBACK[targetLanguage] || {}), detectedCode }
}

async function translateWithGoogleFree(text, targetCode) {
  // Public, keyless endpoint used by the Google Translate web widget. sl=auto
  // asks Google to detect whatever language the sender typed in, in a single
  // request - no separate detection call needed. Best effort / no SLA -
  // fine for a demo/small app, swap providers via TRANSLATION_PROVIDER for
  // anything production-grade.
  const { data } = await axios.get('https://translate.googleapis.com/translate_a/single', {
    params: { client: 'gtx', sl: 'auto', tl: targetCode, dt: 't', q: text },
    timeout: 6000,
  })
  // Response shape: [[["translated chunk","original chunk",null,null,...], ...], null, "es"]
  // The 3rd top-level element is the auto-detected source language code.
  const chunks = data?.[0] || []
  const translated = chunks.map(chunk => chunk[0]).join('')
  const detectedCode = typeof data?.[2] === 'string' ? data[2] : null
  return { translated, detectedCode }
}

async function translateWithGoogleCloud(text, targetCode) {
  // Official Google Cloud Translation API (v2, "Basic" tier - simple API-key
  // auth, no OAuth/service-account setup needed). Free tier covers 500,000
  // characters/month. This is the provider to use on a live/production
  // deployment (e.g. Render) - unlike the free trick endpoint above, it has
  // an actual SLA and won't silently rate-limit or block you.
  // Get a key: https://console.cloud.google.com/apis/credentials (enable the
  // "Cloud Translation API" on the project first).
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY is not set')

  const { data } = await axios.post(
    `https://translation.googleapis.com/language/translate2?key=${apiKey}`,
    { q: text, target: targetCode, format: 'text' }, // source omitted on purpose - lets Google auto-detect it
    { timeout: 8000, headers: { 'Content-Type': 'application/json' } }
  )
  const result = data?.data?.translations?.[0]
  return { translated: result?.translatedText ?? text, detectedCode: result?.detectedSourceLanguage || null }
}

async function translateWithLibreTranslate(text, targetCode) {
  const url = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate'
  const { data } = await axios.post(
    url,
    { q: text, source: 'auto', target: targetCode, format: 'text', api_key: process.env.LIBRETRANSLATE_API_KEY || undefined },
    { timeout: 8000, headers: { 'Content-Type': 'application/json' } }
  )
  return { translated: data?.translatedText ?? text, detectedCode: data?.detectedLanguage?.language || null }
}

/**
 * Detects whatever language `text` is written in and translates it into
 * `targetLanguage` (a name like "Spanish", matching the frontend's language
 * picker) - regardless of what the sender's language was. If the sender is
 * already writing in the recipient's language, the text is returned
 * untouched instead of being needlessly (and often incorrectly) re-translated.
 * Never throws - a translation hiccup should never block message delivery.
 */
export async function translateText(text, targetLanguage) {
  if (!text || !text.trim() || !targetLanguage) return text
  const targetCode = LANGUAGE_CODES[targetLanguage]
  if (!targetCode) return text // unknown language name - don't guess

  const key = cacheKey(text, targetLanguage)
  if (cache.has(key)) return cache.get(key)

  const provider = process.env.TRANSLATION_PROVIDER || 'google-cloud'
  try {
    let result
    if (provider === 'google-cloud') result = await translateWithGoogleCloud(text, targetCode)
    else if (provider === 'google-free') result = await translateWithGoogleFree(text, targetCode)
    else if (provider === 'libretranslate') result = await translateWithLibreTranslate(text, targetCode)
    else result = translateOffline(text, targetLanguage)

    let translated = result.translated
    // Already the recipient's language (per the detector) - don't re-translate it.
    if (result.detectedCode && result.detectedCode === targetCode) translated = text
    if (!translated || !translated.trim()) translated = text

    rememberInCache(key, translated)
    return translated
  } catch (error) {
    console.warn(`[translation] provider "${provider}" failed (${error.message}), using offline fallback`)
    const fallback = translateOffline(text, targetLanguage).translated
    rememberInCache(key, fallback)
    return fallback
  }
}

/** Best-effort detection only (no translation) - handy for diagnostics/logging. */
export function detectLanguage(text) {
  const code = detectLanguageOffline(text)
  return code ? NAME_BY_CODE[code] : null
}

export function isSupportedLanguage(language) {
  return Object.prototype.hasOwnProperty.call(LANGUAGE_CODES, language)
}

export { LANGUAGE_CODES }
