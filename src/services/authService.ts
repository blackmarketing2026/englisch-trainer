const AUTH_STORAGE_KEY = 'english-trainer-authenticated'
const LOGIN_NAME = 'Steven'
const LOGIN_PASSWORD = 'Sonne'

export function isAuthenticated() {
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
}

export function login(username: string, password: string) {
  const valid = username.trim() === LOGIN_NAME && password === LOGIN_PASSWORD
  if (valid) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  }
  return valid
}

export function logout() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
