// Turns a failed request into a sentence a person can act on.
//
// Errors from our API carry a status and a message written for users ("Wrong
// email or password"), so those are shown as they are. An error with no
// status means the request never got an answer at all: no internet, a wrong
// VITE_API_BASE_URL, CORS, or a free-tier server still waking up.
export function friendlyError(error) {
  if (error?.status) return error.message
  return "Couldn't reach the server. Check your connection and try again in a moment."
}
