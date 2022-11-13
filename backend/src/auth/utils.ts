import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import { Auth0JsonWebKey, Auth0SigningKeys } from './auth0Types'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/**
 * Returns a cert
 * credits: https://github.com/sgmeyer/auth0-node-jwks-rs256/blob/df2f15c7c07db72b239d3beb13ad0f089b224791/src/lib/utils.js
 * @param cert Cert
 * @returns
 */
export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

/**
 * credits: https://github.com/sgmeyer/auth0-node-jwks-rs256/blob/master/src/lib/JwksClient.js
 */
export function getSigningKeys(keys: Auth0JsonWebKey[]): Auth0SigningKeys[] {
  const signingKeys = keys
    .filter(
      (key) =>
        key.use === 'sig' && // JWK property `use` determines the JWK is for signing
        key.kty === 'RSA' && // We are only supporting RSA
        key.kid && // The `kid` must be present to be useful for later
        key.x5c &&
        key.x5c.length // Has useful public keys (we aren't using n or e)
    )
    .map((key) => {
      return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) }
    })

  return signingKeys
}
