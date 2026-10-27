// Browser-side translation fallback. Used ONLY when the server could not translate a message
// (free translation services block datacenter IPs like Render's, but not normal users' browsers).
const CODES: Record<string, string> = {
  English: 'en', Hindi: 'hi', Spanish: 'es', Portuguese: 'pt', French: 'fr', Japanese: 'ja', Arabic: 'ar', German: 'de',
}

async function viaGoogle(text: string, target: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`google ${response.status}`)
  const data = await response.json()
  const detected: string | undefined = data?.[2]
  if (detected && detected.split('-')[0] === target) return null // already in the target language
  const translated = (data?.[0] as Array<[string]> | undefined)?.map(part => part[0]).join('')
  return translated || null
}

async function viaMyMemory(text: string, target: string): Promise<string | null> {
  const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 480))}&langpair=Autodetect|${target}`)
  if (!response.ok) throw new Error(`mymemory ${response.status}`)
  const data = await response.json()
  const translated: string | undefined = data?.responseData?.translatedText
  if (!translated || Number(data?.responseStatus) !== 200 || /PLEASE SELECT|MYMEMORY WARNING/i.test(translated)) return null
  return translated
}

/** Returns the translation, or null if the text is already in the target language / nothing worked. */
export async function translateInBrowser(text: string, targetLanguage: string): Promise<string | null> {
  const target = CODES[targetLanguage]
  if (!target || !text.trim()) return null
  for (const provider of [viaGoogle, viaMyMemory]) {
    try {
      const result = await provider(text, target)
      if (result && result.trim() && result.trim() !== text.trim()) return result
      if (result === null && provider === viaGoogle) return null
    } catch { /* try the next provider */ }
  }
  return null
}