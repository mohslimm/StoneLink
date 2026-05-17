import { z } from 'zod';

export const PrototypeCustomizationSchema = z.object({
  prototypeId: z.string().min(1, "L'ID du prototype est requis"),
  prospectId: z.string().min(1, "L'ID du prospect est requis"),
  customizations: z.record(z.string()).optional().default({}),
});

export type PrototypeCustomizationInput = z.infer<typeof PrototypeCustomizationSchema>;

export const MarketLinkRequestSchema = z.object({
  url: z.string().url("URL invalide"),
});

export const ProspectSchema = z.object({
  companyName: z.string().min(1, "Nom de la société requis"),
  contactName: z.string().min(1, "Nom du contact requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal('')),
  niche: z.string().min(1, "Niche requise"),
  country: z.string().length(2, "Code pays invalide (ISO 3166-1 alpha-2)"),
  city: z.string().min(1, "Ville requise"),
  stage: z.string().optional(),
  priority: z.string().optional(),
  estimatedDealValue: z.number().optional(),
});
