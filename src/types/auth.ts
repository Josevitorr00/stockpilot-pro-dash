export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operador";
  avatarUrl?: string;
  company: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpPayload extends Credentials {
  name: string;
  company: string;
}

export interface AuthSession {
  user: User;
  token: string;
  createdAt: string;
}