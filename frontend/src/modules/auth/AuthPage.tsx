import { useMemo, useState, type FormEvent } from 'react'
import { Icon } from '../shared/Icon'
import { authApi, setToken, type ApiUser } from '../api/client'

type AuthMode = 'login' | 'register' | 'forgot' | 'sent'
type AuthPageProps = { onAuthenticated: (user: ApiUser) => void }

// Talks to the real backend (backend/routes/auth.js) - register, login, and
// forgot-password all hit /api/auth/*. On success we store the JWT and hand
// the resolved user object back up to App.tsx.
export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (mode === 'forgot') {
      if (!email.includes('@')) return setError('Enter the email address connected to your account.')
      setLoading(true)
      try {
        await authApi.forgotPassword(email)
        setMode('sent')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not send the reset email.')
      } finally {
        setLoading(false)
      }
      return
    }

    const data = new FormData(event.currentTarget)
    if (mode === 'register' && password.length < 8) return setError('Please create a password with at least 8 characters.')

    setLoading(true)
    try {
      if (mode === 'register') {
        const username = String(data.get('username') || '')
        const { token, user } = await authApi.register({
          name: username,
          username,
          email: String(data.get('email') || ''),
          password: String(data.get('password') || ''),
        })
        setToken(token)
        onAuthenticated(user)
      } else {
        const { token, user } = await authApi.login({
          email: String(data.get('email') || ''),
          password: String(data.get('password') || ''),
        })
        setToken(token)
        onAuthenticated(user)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const changeMode = (next: AuthMode) => { setMode(next); setError(''); setPassword(''); setShowPassword(false) }
  const title = mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Check your inbox'
  const subtitle = mode === 'login' ? 'Sign in to keep every conversation flowing.' : mode === 'register' ? 'One account. Every language. Any conversation.' : mode === 'forgot' ? 'We’ll send a secure reset link to your email.' : `We sent password reset instructions to ${email || 'your email address'}.`
  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one"/><div className="auth-glow auth-glow-two"/>
      <section className="auth-showcase">
        <button className="brand auth-brand" onClick={() => changeMode('login')} aria-label="UniTalk login"><span className="brand-mark"><span/><span/><span/></span><span>unitalk</span></button>
        <div className="auth-copy"><span className="language-pill"><Icon name="globe" size={14}/> 100+ languages, one place</span><h1>Every language.<br/><em>One conversation.</em></h1><p>UniTalk brings people together with seamless, real-time translation that feels natural.</p></div>
        <div className="auth-visual" aria-hidden="true"><div className="visual-card card-a"><span className="card-avatar">JM</span><p>Do you want to collaborate?</p><small>English</small></div><div className="visual-card card-b"><p>¿Qué ideas tienes?</p><small>Translated from Spanish</small></div><div className="visual-orbit"><Icon name="message" size={27}/><i/><i/><i/></div></div>
        <p className="auth-copyright">© 2026 UniTalk · Built for human connection</p>
      </section>
      <main className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-mobile-brand"><span className="brand-mark"><span/><span/><span/></span> unitalk</div>
          {mode !== 'sent' && <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Create account</button></div>}
          <div className="auth-heading"><h2>{title}</h2><p>{subtitle}</p></div>
          {mode === 'sent' ? <div className="reset-sent"><span className="email-icon"><Icon name="message" size={25}/></span><p>Didn’t get an email? Check your spam folder or <button onClick={() => changeMode('forgot')}>try another address</button>.</p><button className="primary-auth-button" onClick={() => changeMode('login')}>Back to sign in</button></div> : <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && <label><span>Username</span><div className="input-prefix"><i>@</i><input name="username" required minLength={3} placeholder="choose a username" autoComplete="username" /></div></label>}
            <label><span>Email address</span><input name="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
            {mode !== 'forgot' && <label><span>{mode === 'register' ? 'Create password' : 'Password'}</span><div className="password-input"><input name="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === 'register' ? 'Create a strong password' : 'Enter your password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>}
            {mode === 'register' && <div className="password-strength" aria-label={`Password strength: ${labels[strength] || 'not set'}`}><div>{[1, 2, 3, 4].map(step => <i key={step} className={strength >= step ? `filled level-${strength}` : ''}/>)}</div><span>{password ? labels[strength] : 'Use 8+ characters'}</span></div>}
            {mode === 'login' && <div className="login-options"><label className="remember"><input type="checkbox" name="remember" defaultChecked/><span>Remember me</span></label><button type="button" onClick={() => changeMode('forgot')}>Forgot password?</button></div>}
            {error && <p className="auth-error">{error}</p>}
            <button className="primary-auth-button" type="submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in to UniTalk' : mode === 'register' ? 'Create account' : 'Send reset link'} <Icon name="chevronRight" size={17}/></button>
          </form>}
          {mode !== 'forgot' && mode !== 'sent' && <><div className="or-divider"><span>or continue with</span></div><button type="button" className="google-button" onClick={() => setError('Google sign-in is not wired up yet - please use email and password.')}><span className="google-g">G</span> Continue with Google</button></>}
          {mode === 'forgot' && <button className="back-auth" onClick={() => changeMode('login')}>← Back to sign in</button>}
          {mode === 'login' && <p className="auth-switch">New to UniTalk? <button onClick={() => changeMode('register')}>Create an account</button></p>}
        </div>
      </main>
    </div>
  )
}