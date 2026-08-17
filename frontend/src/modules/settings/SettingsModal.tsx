import { useState } from 'react'
import { Icon } from '../shared/Icon'
import type { Locale, SettingsModalStrings } from '../i18n/translations'

type SettingsModalProps = {
  onClose: () => void
  dark: boolean
  onThemeToggle: () => void
  autoTranslate: boolean
  showOriginal: boolean
  defaultLanguage: string
  appLanguage: Locale
  onAutoTranslateToggle: () => void
  onShowOriginalToggle: () => void
  onDefaultLanguageChange: (language: string) => void
  onAppLanguageChange: (language: Locale) => void
  strings: SettingsModalStrings
}

type SettingsTab = 'general' | 'language'

const languageOptions = ['English', 'Hindi', 'Spanish', 'Portuguese', 'French', 'Japanese', 'Arabic', 'German']
const appLanguageOptions: Locale[] = ['English', 'Spanish', 'French']

export function SettingsModal({ onClose, dark, onThemeToggle, autoTranslate, showOriginal, defaultLanguage, appLanguage, onAutoTranslateToggle, onShowOriginalToggle, onDefaultLanguageChange, onAppLanguageChange, strings }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  const renderTabContent = () => {
    if (activeTab === 'language') {
      return (
        <>
          <h3>{strings.languagePreferencesHeading}</h3>
          <p>{strings.languagePreferencesText}</p>
          <div className="setting-row">
            <span><b>{strings.defaultTranslationLanguage}</b><small>{strings.defaultTranslationDescription}</small></span>
            <select value={defaultLanguage} onChange={event => onDefaultLanguageChange(event.target.value)}>
              {languageOptions.map(language => <option key={language} value={language}>{language}</option>)}
            </select>
          </div>
          <div className="setting-row">
            <span><b>{strings.appLanguage}</b><small>{strings.appLanguageDescription}</small></span>
            <select value={appLanguage} onChange={event => onAppLanguageChange(event.target.value as Locale)}>
              {appLanguageOptions.map(language => <option key={language} value={language}>{language}</option>)}
            </select>
          </div>
        </>
      )
    }

    return (
      <>
        <h3>{strings.conversationPreferencesHeading}</h3>
        <p>{strings.conversationPreferencesText}</p>
        <div className="setting-row"><span><b>{strings.automaticTranslation}</b><small>{strings.automaticTranslationDescription}</small></span><button className={`switch ${autoTranslate ? 'on' : ''}`} onClick={onAutoTranslateToggle}><i/></button></div>
        <div className="setting-row"><span><b>{strings.showOriginalMessage}</b><small>{strings.showOriginalDescription}</small></span><button className={`switch ${showOriginal ? 'on' : ''}`} onClick={onShowOriginalToggle}><i/></button></div>
        <div className="setting-row"><span><b>{strings.appearance}</b><small>{dark ? strings.darkModeOn : strings.lightModeOn}</small></span><button className="theme-setting" onClick={onThemeToggle}><Icon name={dark ? 'moon' : 'sun'} size={17}/>{dark ? 'Dark' : 'Light'}</button></div>
      </>
    )
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal settings-modal" onMouseDown={e => e.stopPropagation()}>
        <header>
          <div>
            <p className="eyebrow">{strings.preferences}</p>
            <h2>{strings.settingsHeader}</h2>
          </div>
          <button type="button" onClick={onClose}><Icon name="x"/></button>
        </header>
        <div className="settings-layout">
          <nav>
            <button type="button" className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}><Icon name="settings"/> {strings.generalTab}</button>
            <button type="button" className={activeTab === 'language' ? 'active' : ''} onClick={() => setActiveTab('language')}><Icon name="globe"/> {strings.languageTab}</button>
          </nav>
          <main>
            {renderTabContent()}
          </main>
        </div>
      </section>
    </div>
  )
}
