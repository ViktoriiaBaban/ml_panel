import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production'

const secretKey = new TextEncoder().encode(JWT_SECRET)

export async function signAccessToken(userId: number): Promise<string> {
  return new jose.SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

export async function verifyAccessToken(token: string): Promise<jose.JWTPayload> {
  const { payload } = await jose.jwtVerify(token, secretKey)
  return payload
}
