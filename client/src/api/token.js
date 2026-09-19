// Where the login token lives between visits. Both API implementations use
// this, so staying logged in survives a page reload.
//
// localStorage can be read by any JavaScript on the page, so a cross-site
// scripting bug could steal the token. The alternative, an httpOnly cookie, is
// hard to make work between github.io and a separate API host. This is the
// tradeoff to write about in docs/06-security-and-privacy.md.

const KEY = 'subalert:token'

export const getToken = () => localStorage.getItem(KEY)

export const setToken = (token) => localStorage.setItem(KEY, token)

export const clearToken = () => localStorage.removeItem(KEY)
