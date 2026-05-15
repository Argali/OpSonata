import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId:    "5dcaf286-6c13-42fc-99f0-94e991d86354",
    authority:   "https://login.microsoftonline.com/65e803c0-672a-4162-85a7-e1a402843bd2",
    // Strip trailing slash so the URI matches exactly what's registered in Azure
    redirectUri: window.location.origin + "/",
  },
  cache: {
    cacheLocation:          "sessionStorage",
    storeAuthStateInCookie: true, // Firefox ETP fix — cookie fallback when sessionStorage is blocked
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
// Initialized lazily in AppInner before first use — no top-level await
