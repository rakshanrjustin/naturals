export type CardDeliveryStatus = "pending" | "sent" | "failed";

export type ConnectionLookingFor =
  | "customers"
  | "distributors"
  | "investors"
  | "franchise"
  | "vendors"
  | "mentors"
  | "tech_partners";

export type BusinessCategory =
  | "beauty_wellness"
  | "fashion_apparel"
  | "food_beverage"
  | "health_fitness"
  | "education_training"
  | "technology"
  | "retail"
  | "professional_services"
  | "manufacturing"
  | "real_estate"
  | "finance"
  | "media_entertainment"
  | "other";

export interface Registration {
  id: string;
  full_name: string;
  designation: string;
  business_name: string;
  business_category: BusinessCategory;
  description: string;
  mobile_number: string;
  whatsapp_number: string | null;
  email: string;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  city: string;
  photo_url: string | null;
  looking_for: ConnectionLookingFor;
  consent_required: boolean;
  consent_marketing: boolean;
  card_delivery_status: CardDeliveryStatus;
  created_at: string;
}

export type RegistrationInsert = Omit<Registration, "id" | "created_at" | "card_delivery_status">;

export const BUSINESS_CATEGORIES: { value: BusinessCategory; label: string }[] = [
  { value: "beauty_wellness", label: "Beauty & Wellness" },
  { value: "fashion_apparel", label: "Fashion & Apparel" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "health_fitness", label: "Health & Fitness" },
  { value: "education_training", label: "Education & Training" },
  { value: "technology", label: "Technology" },
  { value: "retail", label: "Retail" },
  { value: "professional_services", label: "Professional Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "real_estate", label: "Real Estate" },
  { value: "finance", label: "Finance" },
  { value: "media_entertainment", label: "Media & Entertainment" },
  { value: "other", label: "Other" },
];

export const CONNECTION_OPTIONS: { value: ConnectionLookingFor; label: string }[] = [
  { value: "customers", label: "Customers" },
  { value: "distributors", label: "Distributors" },
  { value: "investors", label: "Investors" },
  { value: "franchise", label: "Franchise Partners" },
  { value: "vendors", label: "Vendors" },
  { value: "mentors", label: "Mentors" },
  { value: "tech_partners", label: "Tech Partners" },
];
