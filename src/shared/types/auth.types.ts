export interface JwtPayload {
  sub: string; // Subject (user ID)
  email: string;
  username: string;
  roles: string[];
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}
