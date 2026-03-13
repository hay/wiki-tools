declare global {
  interface Window {
    __ctx__?: {
      authUrl?: string;
      isAccessTokenRequest?: boolean;
      isDebug?: boolean;
      isInvalidAccessTokenRequest?: boolean;
      isLoggedIn?: boolean;
      isLoggedOut?: boolean;
      rootUrl?: string;
      userName?: string;
    };
  }
}

export {};
