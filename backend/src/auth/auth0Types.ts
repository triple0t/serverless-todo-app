/**
 * A payload of getSigningKeys
 */
export interface Auth0SigningKeys {
  kid: string
  publicKey: string
}

export interface Auth0JsonWebKey {
  alg: string
  kty: string
  use: string
  n: string
  e: string
  kid: string
  x5t: string
  x5c: string[]
}

export interface Auth0JsonWebKeyResponse {
  keys: Auth0JsonWebKey[]
}
