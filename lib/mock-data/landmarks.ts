// lib/mock-data/landmarks.ts
export type LandmarkType = "transport" | "commerce" | "culte" | "santé" | "loisir" | "éducation";

export interface Landmark {
  id: string;
  name: string;
  quartier: string;
  type: LandmarkType;
  lat: number;
  lng: number;
}

export const landmarks: Landmark[] = [
  { id: "lm-001", name: "Grande Mosquée de Dakar", quartier: "Médina", type: "culte", lat: 14.6770, lng: -17.4480 },
  { id: "lm-002", name: "Marché Sandaga", quartier: "Plateau", type: "commerce", lat: 14.6730, lng: -17.4380 },
  { id: "lm-003", name: "Marché Kermel", quartier: "Plateau", type: "commerce", lat: 14.6716, lng: -17.4321 },
  { id: "lm-004", name: "Total Liberté 6", quartier: "Liberté 6", type: "transport", lat: 14.7245, lng: -17.4622 },
  { id: "lm-005", name: "Total Mermoz", quartier: "Mermoz", type: "transport", lat: 14.7142, lng: -17.4781 },
  { id: "lm-006", name: "Total VDN", quartier: "VDN", type: "transport", lat: 14.7290, lng: -17.4710 },
  { id: "lm-007", name: "Place de l'Indépendance", quartier: "Plateau", type: "loisir", lat: 14.6699, lng: -17.4356 },
  { id: "lm-008", name: "Université Cheikh Anta Diop", quartier: "Fann", type: "éducation", lat: 14.6920, lng: -17.4634 },
  { id: "lm-009", name: "Hôpital Principal de Dakar", quartier: "Plateau", type: "santé", lat: 14.6680, lng: -17.4280 },
  { id: "lm-010", name: "Sea Plaza", quartier: "Almadies", type: "commerce", lat: 14.7415, lng: -17.5145 },
  { id: "lm-011", name: "Allées Khalifa Ababacar Sy", quartier: "Médina", type: "transport", lat: 14.6840, lng: -17.4470 },
  { id: "lm-012", name: "Patte d'Oie", quartier: "Patte d'Oie", type: "transport", lat: 14.7330, lng: -17.4520 },
  { id: "lm-013", name: "Auchan Sacré-Cœur", quartier: "Sacré-Cœur", type: "commerce", lat: 14.7095, lng: -17.4595 },
  { id: "lm-014", name: "Casino Supermarché Mermoz", quartier: "Mermoz", type: "commerce", lat: 14.7125, lng: -17.4760 },
  { id: "lm-015", name: "Stade Léopold Sédar Senghor", quartier: "Pikine", type: "loisir", lat: 14.7480, lng: -17.4180 },
  { id: "lm-016", name: "Aéroport LSS (ancien)", quartier: "Yoff", type: "transport", lat: 14.7395, lng: -17.4900 },
  { id: "lm-017", name: "Corniche Ouest", quartier: "Mamelles", type: "loisir", lat: 14.7185, lng: -17.4995 },
  { id: "lm-018", name: "Embarcadère Île de Gorée", quartier: "Plateau", type: "transport", lat: 14.6708, lng: -17.4225 },
  { id: "lm-019", name: "Mosquée de la Divinité", quartier: "Ouakam", type: "culte", lat: 14.7245, lng: -17.5050 },
  { id: "lm-020", name: "Monument de la Renaissance", quartier: "Ouakam", type: "loisir", lat: 14.7270, lng: -17.4965 },
  { id: "lm-021", name: "Phare des Mamelles", quartier: "Mamelles", type: "loisir", lat: 14.7235, lng: -17.5125 },
  { id: "lm-022", name: "Hôpital Le Dantec", quartier: "Plateau", type: "santé", lat: 14.6740, lng: -17.4290 },
  { id: "lm-023", name: "Marché Tilène", quartier: "Médina", type: "commerce", lat: 14.6810, lng: -17.4450 },
  { id: "lm-024", name: "Marché HLM", quartier: "HLM", type: "commerce", lat: 14.7220, lng: -17.4590 },
  { id: "lm-025", name: "Gare routière Pompiers", quartier: "Liberté 5", type: "transport", lat: 14.7145, lng: -17.4615 },
  { id: "lm-026", name: "Ucad 2", quartier: "Fann", type: "éducation", lat: 14.6915, lng: -17.4620 },
  { id: "lm-027", name: "Lycée Lamine Guèye", quartier: "Plateau", type: "éducation", lat: 14.6725, lng: -17.4330 },
  { id: "lm-028", name: "Place du Souvenir Africain", quartier: "Corniche", type: "loisir", lat: 14.7160, lng: -17.4885 },
  { id: "lm-029", name: "Cathédrale Notre-Dame des Victoires", quartier: "Plateau", type: "culte", lat: 14.6720, lng: -17.4310 },
  { id: "lm-030", name: "Auchan Liberté 6", quartier: "Liberté 6", type: "commerce", lat: 14.7280, lng: -17.4630 },
  { id: "lm-031", name: "Hôpital Fann", quartier: "Fann", type: "santé", lat: 14.6940, lng: -17.4655 },
  { id: "lm-032", name: "Stade Iba Mar Diop", quartier: "Médina", type: "loisir", lat: 14.6855, lng: -17.4395 },
  { id: "lm-033", name: "Pharmacie Mermoz Centre", quartier: "Mermoz", type: "santé", lat: 14.7155, lng: -17.4795 },
  { id: "lm-034", name: "Centre Culturel Blaise Senghor", quartier: "HLM", type: "loisir", lat: 14.7230, lng: -17.4575 },
  { id: "lm-035", name: "Marché Castors", quartier: "Castors", type: "commerce", lat: 14.7195, lng: -17.4445 },
  { id: "lm-036", name: "Gare de Dakar", quartier: "Plateau", type: "transport", lat: 14.6735, lng: -17.4250 },
  { id: "lm-037", name: "Mosquée Massalikoul Djinane", quartier: "Colobane", type: "culte", lat: 14.6940, lng: -17.4495 },
  { id: "lm-038", name: "Lycée Blaise Diagne", quartier: "Plateau", type: "éducation", lat: 14.6750, lng: -17.4365 },
  { id: "lm-039", name: "BICIS Plateau", quartier: "Plateau", type: "commerce", lat: 14.6705, lng: -17.4365 },
  { id: "lm-040", name: "Galerie Cinquième Avenue", quartier: "Mermoz", type: "commerce", lat: 14.7165, lng: -17.4805 },
  { id: "lm-041", name: "Eden Plaza", quartier: "Almadies", type: "commerce", lat: 14.7430, lng: -17.5180 },
  { id: "lm-042", name: "Plage de Yoff", quartier: "Yoff", type: "loisir", lat: 14.7560, lng: -17.4860 },
  { id: "lm-043", name: "Plage des Almadies", quartier: "Almadies", type: "loisir", lat: 14.7480, lng: -17.5260 },
  { id: "lm-044", name: "Lac Rose (Retba)", quartier: "Niaga", type: "loisir", lat: 14.8400, lng: -17.2360 },
  { id: "lm-045", name: "Total Yoff", quartier: "Yoff", type: "transport", lat: 14.7440, lng: -17.4830 },
  { id: "lm-046", name: "Total Almadies", quartier: "Almadies", type: "transport", lat: 14.7475, lng: -17.5210 },
  { id: "lm-047", name: "Marché Grand Yoff", quartier: "Grand Yoff", type: "commerce", lat: 14.7340, lng: -17.4640 },
  { id: "lm-048", name: "Hôpital Roi Baudouin", quartier: "Guédiawaye", type: "santé", lat: 14.7740, lng: -17.4055 },
  { id: "lm-049", name: "Université Amadou Mahtar Mbow", quartier: "Diamniadio", type: "éducation", lat: 14.7220, lng: -17.1840 },
  { id: "lm-050", name: "Centre Commercial Dakar City", quartier: "Diamniadio", type: "commerce", lat: 14.7245, lng: -17.1850 },
  { id: "lm-051", name: "Marché Liberté 6", quartier: "Liberté 6", type: "commerce", lat: 14.7270, lng: -17.4640 },
  { id: "lm-052", name: "Mermoz Plage", quartier: "Mermoz", type: "loisir", lat: 14.7200, lng: -17.4830 },
];

export function searchLandmarks(query: string, limit = 6): Landmark[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return landmarks
    .filter((l) => l.name.toLowerCase().includes(q) || l.quartier.toLowerCase().includes(q))
    .slice(0, limit);
}
