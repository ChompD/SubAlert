// Where the login token lives between visits. Both API implementations use
// this, so staying logged in survives a page reload.
//
// localStorage can be read by any JavaScript on the page, so a cross-site
// scripting bug could steal the token. React escapes everything it shows, which
// keeps that risk low, but an httpOnly cookie (which page scripts can't read)
// would be safer. It is listed as a next step in the README.

const KEY = 'subalert:token'

export const getToken = () => localStorage.getItem(KEY)

export const setToken = (token) => localStorage.setItem(KEY, token)

export const clearToken = () => localStorage.removeItem(KEY)
