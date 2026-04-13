// In-memory session cache, keyed by encrypted access token (the cookie value).
// Avoids hitting micro.blog's /account/verify on every authenticated request.
//
// Lives in its own module so both main.js (read in request setup) and
// routes/auth.js (write on login) can import the same map without
// circular imports.
export const SESSION = {};
