declare global {
  interface Window {
    __ctx__: {
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

export interface ApiResponse {
  error?: { info?: string };
  ok?: boolean;
  id?: string;
  status?: boolean;
}

export interface PetScanResult {
  title: string;
  q: string;
}

export interface SparqlBinding {
  item?: { value: string };
  image?: { value: string };
  cat?: { value: string };
}
