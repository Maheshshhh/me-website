export function isValidLocalCredentials(
  username: string,
  password: string,
  expectedUsername: string,
  expectedPassword: string,
): boolean {
  return Boolean(expectedUsername && expectedPassword)
    && username === expectedUsername
    && password === expectedPassword;
}
