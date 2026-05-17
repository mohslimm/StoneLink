export type PrototypeId = string;

export interface PrototypeCustomization {
  COMPANY_NAME?: string;
  PRIMARY_COLOR?: string;
  LOGO?: string;
  PHONE?: string;
  ADDRESS?: string;
  TAGLINE?: string;
  [key: string]: string | undefined;
}

export interface CustomizeRequest {
  prototypeId: PrototypeId;
  prospectId: string;
  customizations: PrototypeCustomization;
}

export interface CustomizeResponse {
  previewUrl: string;
  generatedAt: string;
}

export interface PrototypeResolverEntry {
  slug: string;
  niche: string;
}

export type PrototypeResolver = Record<PrototypeId, PrototypeResolverEntry>;
