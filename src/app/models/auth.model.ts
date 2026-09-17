export interface AuthRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  mfaRequired: boolean;
  isSetup?: boolean;       // 👈 true = QR კოდი უნდა გამოვაჩინოთ
  qrCodeUri?: string;      // 👈 QR კოდის სურათის Base64
  secret?: string;         // 👈 Secret key ხელით ჩასასმელად
  message?: string;
}

export interface Verify2faRequest {
  email: string;
  code: string;
}

// ✨ ახალი ინტერფეისები Authenticator Setup-ისთვის
export interface MfaSetupResponse {
  secretKey: string;
  qrCodeUri: string; // Base64 სურათის URL ან Data URI
}

export interface EnableMfaRequest {
  email: string;
  code: string;
}