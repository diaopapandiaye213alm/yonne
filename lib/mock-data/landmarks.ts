// lib/mock-data/landmarks.ts
export type LandmarkType = "transport" | "commerce" | "culte" | "santé" | "loisir" | "éducation";

export interface Landmark {
  id: string;
  name: string;
  quartier: string;
  type: LandmarkType;
  lat: number;
  lng: number;
  zone_id?: string; // zone de couverture — optionnel, aligne sur zones table
}

export const landmarks: Landmark[] = [

  // ══════════════════════════════════════════════════════════════════
  //  DAKAR — Plateau / Médina              zone: zone-plateau
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-001", name: "Grande Mosquée de Dakar",            quartier: "Médina",       type: "culte",      lat: 14.6770, lng: -17.4480, zone_id: "zone-plateau" },
  { id: "lm-002", name: "Marché Sandaga",                     quartier: "Plateau",      type: "commerce",   lat: 14.6730, lng: -17.4380, zone_id: "zone-plateau" },
  { id: "lm-003", name: "Marché Kermel",                      quartier: "Plateau",      type: "commerce",   lat: 14.6716, lng: -17.4321, zone_id: "zone-plateau" },
  { id: "lm-007", name: "Place de l'Indépendance",            quartier: "Plateau",      type: "loisir",     lat: 14.6699, lng: -17.4356, zone_id: "zone-plateau" },
  { id: "lm-009", name: "Hôpital Principal de Dakar",         quartier: "Plateau",      type: "santé",      lat: 14.6680, lng: -17.4280, zone_id: "zone-plateau" },
  { id: "lm-018", name: "Embarcadère Île de Gorée",           quartier: "Plateau",      type: "transport",  lat: 14.6708, lng: -17.4225, zone_id: "zone-plateau" },
  { id: "lm-022", name: "Hôpital Le Dantec",                  quartier: "Plateau",      type: "santé",      lat: 14.6740, lng: -17.4290, zone_id: "zone-plateau" },
  { id: "lm-027", name: "Lycée Lamine Guèye",                 quartier: "Plateau",      type: "éducation",  lat: 14.6725, lng: -17.4330, zone_id: "zone-plateau" },
  { id: "lm-029", name: "Cathédrale Notre-Dame des Victoires", quartier: "Plateau",     type: "culte",      lat: 14.6720, lng: -17.4310, zone_id: "zone-plateau" },
  { id: "lm-036", name: "Gare de Dakar",                      quartier: "Plateau",      type: "transport",  lat: 14.6735, lng: -17.4250, zone_id: "zone-plateau" },
  { id: "lm-038", name: "Lycée Blaise Diagne",                quartier: "Plateau",      type: "éducation",  lat: 14.6750, lng: -17.4365, zone_id: "zone-plateau" },
  { id: "lm-039", name: "BICIS Plateau",                      quartier: "Plateau",      type: "commerce",   lat: 14.6705, lng: -17.4365, zone_id: "zone-plateau" },
  { id: "lm-011", name: "Allées Khalifa Ababacar Sy",         quartier: "Médina",       type: "transport",  lat: 14.6840, lng: -17.4470, zone_id: "zone-plateau" },
  { id: "lm-023", name: "Marché Tilène",                      quartier: "Médina",       type: "commerce",   lat: 14.6810, lng: -17.4450, zone_id: "zone-plateau" },
  { id: "lm-032", name: "Stade Iba Mar Diop",                 quartier: "Médina",       type: "loisir",     lat: 14.6855, lng: -17.4395, zone_id: "zone-plateau" },
  { id: "lm-037", name: "Mosquée Massalikoul Djinane",        quartier: "Colobane",     type: "culte",      lat: 14.6940, lng: -17.4495, zone_id: "zone-plateau" },

  // ══════════════════════════════════════════════════════════════════
  //  DAKAR — Liberté / HLM / Grand Yoff    zone: zone-nord
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-004", name: "Total Liberté 6",                    quartier: "Liberté 6",    type: "transport",  lat: 14.7245, lng: -17.4622, zone_id: "zone-nord" },
  { id: "lm-012", name: "Patte d'Oie",                        quartier: "Patte d'Oie",  type: "transport",  lat: 14.7330, lng: -17.4520, zone_id: "zone-nord" },
  { id: "lm-024", name: "Marché HLM",                         quartier: "HLM",          type: "commerce",   lat: 14.7220, lng: -17.4590, zone_id: "zone-nord" },
  { id: "lm-025", name: "Gare routière Pompiers",             quartier: "Liberté 5",    type: "transport",  lat: 14.7145, lng: -17.4615, zone_id: "zone-nord" },
  { id: "lm-030", name: "Auchan Liberté 6",                   quartier: "Liberté 6",    type: "commerce",   lat: 14.7280, lng: -17.4630, zone_id: "zone-nord" },
  { id: "lm-034", name: "Centre Culturel Blaise Senghor",     quartier: "HLM",          type: "loisir",     lat: 14.7230, lng: -17.4575, zone_id: "zone-nord" },
  { id: "lm-035", name: "Marché Castors",                     quartier: "Castors",      type: "commerce",   lat: 14.7195, lng: -17.4445, zone_id: "zone-nord" },
  { id: "lm-047", name: "Marché Grand Yoff",                  quartier: "Grand Yoff",   type: "commerce",   lat: 14.7340, lng: -17.4640, zone_id: "zone-nord" },
  { id: "lm-051", name: "Marché Liberté 6",                   quartier: "Liberté 6",    type: "commerce",   lat: 14.7270, lng: -17.4640, zone_id: "zone-nord" },
  { id: "lm-008", name: "Université Cheikh Anta Diop",        quartier: "Fann",         type: "éducation",  lat: 14.6920, lng: -17.4634, zone_id: "zone-nord" },
  { id: "lm-026", name: "Ucad 2",                             quartier: "Fann",         type: "éducation",  lat: 14.6915, lng: -17.4620, zone_id: "zone-nord" },
  { id: "lm-031", name: "Hôpital Fann",                       quartier: "Fann",         type: "santé",      lat: 14.6940, lng: -17.4655, zone_id: "zone-nord" },

  // ══════════════════════════════════════════════════════════════════
  //  DAKAR — Sacré-Cœur / Mermoz           zone: zone-sacre
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-005", name: "Total Mermoz",                       quartier: "Mermoz",       type: "transport",  lat: 14.7142, lng: -17.4781, zone_id: "zone-sacre" },
  { id: "lm-013", name: "Auchan Sacré-Cœur",                  quartier: "Sacré-Cœur",   type: "commerce",   lat: 14.7095, lng: -17.4595, zone_id: "zone-sacre" },
  { id: "lm-014", name: "Casino Supermarché Mermoz",          quartier: "Mermoz",       type: "commerce",   lat: 14.7125, lng: -17.4760, zone_id: "zone-sacre" },
  { id: "lm-033", name: "Pharmacie Mermoz Centre",            quartier: "Mermoz",       type: "santé",      lat: 14.7155, lng: -17.4795, zone_id: "zone-sacre" },
  { id: "lm-040", name: "Galerie Cinquième Avenue",           quartier: "Mermoz",       type: "commerce",   lat: 14.7165, lng: -17.4805, zone_id: "zone-sacre" },
  { id: "lm-052", name: "Mermoz Plage",                       quartier: "Mermoz",       type: "loisir",     lat: 14.7200, lng: -17.4830, zone_id: "zone-sacre" },
  { id: "lm-028", name: "Place du Souvenir Africain",         quartier: "Corniche",     type: "loisir",     lat: 14.7160, lng: -17.4885, zone_id: "zone-sacre" },

  // ══════════════════════════════════════════════════════════════════
  //  DAKAR — VDN / Almadies / Yoff / Ouakam  zone: zone-vdn
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-006", name: "Total VDN",                          quartier: "VDN",          type: "transport",  lat: 14.7290, lng: -17.4710, zone_id: "zone-vdn" },
  { id: "lm-010", name: "Sea Plaza",                          quartier: "Almadies",     type: "commerce",   lat: 14.7415, lng: -17.5145, zone_id: "zone-vdn" },
  { id: "lm-016", name: "Aéroport LSS (ancien)",              quartier: "Yoff",         type: "transport",  lat: 14.7395, lng: -17.4900, zone_id: "zone-vdn" },
  { id: "lm-017", name: "Corniche Ouest",                     quartier: "Mamelles",     type: "loisir",     lat: 14.7185, lng: -17.4995, zone_id: "zone-vdn" },
  { id: "lm-019", name: "Mosquée de la Divinité",             quartier: "Ouakam",       type: "culte",      lat: 14.7245, lng: -17.5050, zone_id: "zone-vdn" },
  { id: "lm-020", name: "Monument de la Renaissance",         quartier: "Ouakam",       type: "loisir",     lat: 14.7270, lng: -17.4965, zone_id: "zone-vdn" },
  { id: "lm-021", name: "Phare des Mamelles",                 quartier: "Mamelles",     type: "loisir",     lat: 14.7235, lng: -17.5125, zone_id: "zone-vdn" },
  { id: "lm-041", name: "Eden Plaza",                         quartier: "Almadies",     type: "commerce",   lat: 14.7430, lng: -17.5180, zone_id: "zone-vdn" },
  { id: "lm-042", name: "Plage de Yoff",                      quartier: "Yoff",         type: "loisir",     lat: 14.7560, lng: -17.4860, zone_id: "zone-vdn" },
  { id: "lm-043", name: "Plage des Almadies",                 quartier: "Almadies",     type: "loisir",     lat: 14.7480, lng: -17.5260, zone_id: "zone-vdn" },
  { id: "lm-045", name: "Total Yoff",                         quartier: "Yoff",         type: "transport",  lat: 14.7440, lng: -17.4830, zone_id: "zone-vdn" },
  { id: "lm-046", name: "Total Almadies",                     quartier: "Almadies",     type: "transport",  lat: 14.7475, lng: -17.5210, zone_id: "zone-vdn" },

  // ══════════════════════════════════════════════════════════════════
  //  DAKAR — Pikine / Guédiawaye           zone: zone-pikine
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-015", name: "Stade Léopold Sédar Senghor",        quartier: "Pikine",       type: "loisir",     lat: 14.7480, lng: -17.4180, zone_id: "zone-pikine" },
  { id: "lm-048", name: "Hôpital Roi Baudouin",               quartier: "Guédiawaye",   type: "santé",      lat: 14.7740, lng: -17.4055, zone_id: "zone-pikine" },
  { id: "lm-044", name: "Lac Rose (Retba)",                   quartier: "Niaga",        type: "loisir",     lat: 14.8400, lng: -17.2360 },

  // ══════════════════════════════════════════════════════════════════
  //  RUFISQUE — Banlieue est de Dakar      zone: zone-rufisque
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-rf-001", name: "Gare TER Rufisque",               quartier: "Rufisque",     type: "transport",  lat: 14.7155, lng: -17.2728, zone_id: "zone-rufisque" },
  { id: "lm-rf-002", name: "Marché Central de Rufisque",      quartier: "Rufisque",     type: "commerce",   lat: 14.7180, lng: -17.2710, zone_id: "zone-rufisque" },
  { id: "lm-rf-003", name: "Hôpital Youssou Mbargane",        quartier: "Rufisque",     type: "santé",      lat: 14.7165, lng: -17.2750, zone_id: "zone-rufisque" },
  { id: "lm-rf-004", name: "Mosquée Centrale de Rufisque",    quartier: "Rufisque",     type: "culte",      lat: 14.7170, lng: -17.2720, zone_id: "zone-rufisque" },
  { id: "lm-rf-005", name: "Vieille Ville de Rufisque",       quartier: "Vieille Ville",type: "loisir",     lat: 14.7160, lng: -17.2730, zone_id: "zone-rufisque" },
  { id: "lm-rf-006", name: "Lycée André Peytavin",            quartier: "Rufisque",     type: "éducation",  lat: 14.7150, lng: -17.2745, zone_id: "zone-rufisque" },
  { id: "lm-rf-007", name: "Gare routière de Rufisque",       quartier: "Rufisque",     type: "transport",  lat: 14.7190, lng: -17.2700, zone_id: "zone-rufisque" },
  { id: "lm-rf-008", name: "Cathédrale de Rufisque",          quartier: "Rufisque",     type: "culte",      lat: 14.7162, lng: -17.2725, zone_id: "zone-rufisque" },
  { id: "lm-rf-009", name: "Palais de Justice de Rufisque",   quartier: "Rufisque",     type: "commerce",   lat: 14.7168, lng: -17.2715, zone_id: "zone-rufisque" },
  { id: "lm-rf-010", name: "Marché Castors Rufisque",         quartier: "Castors Est",  type: "commerce",   lat: 14.7200, lng: -17.2690, zone_id: "zone-rufisque" },

  // ══════════════════════════════════════════════════════════════════
  //  BARGNY                                zone: zone-bargny
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-by-001", name: "Gare TER Bargny",                 quartier: "Bargny",       type: "transport",  lat: 14.6970, lng: -17.2275, zone_id: "zone-bargny" },
  { id: "lm-by-002", name: "Marché de Bargny",                quartier: "Bargny",       type: "commerce",   lat: 14.6964, lng: -17.2286, zone_id: "zone-bargny" },
  { id: "lm-by-003", name: "Port de Bargny",                  quartier: "Bargny",       type: "transport",  lat: 14.6950, lng: -17.2300, zone_id: "zone-bargny" },
  { id: "lm-by-004", name: "Mosquée de Bargny",               quartier: "Bargny",       type: "culte",      lat: 14.6960, lng: -17.2290, zone_id: "zone-bargny" },
  { id: "lm-by-005", name: "Centre de Santé de Bargny",       quartier: "Bargny",       type: "santé",      lat: 14.6965, lng: -17.2280, zone_id: "zone-bargny" },
  { id: "lm-by-006", name: "Quartier Pêcheurs Bargny",        quartier: "Bargny",       type: "loisir",     lat: 14.6955, lng: -17.2310, zone_id: "zone-bargny" },

  // ══════════════════════════════════════════════════════════════════
  //  DIAMNIADIO — Nouveau pôle urbain      zone: zone-diamniadio
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-049",    name: "Université Amadou Mahtar Mbow",   quartier: "Diamniadio",   type: "éducation",  lat: 14.7220, lng: -17.1840, zone_id: "zone-diamniadio" },
  { id: "lm-050",    name: "Centre Commercial Dakar City",    quartier: "Diamniadio",   type: "commerce",   lat: 14.7245, lng: -17.1850, zone_id: "zone-diamniadio" },
  { id: "lm-dm-001", name: "Sphères Ministérielles",         quartier: "Diamniadio",   type: "commerce",   lat: 14.7140, lng: -17.1820, zone_id: "zone-diamniadio" },
  { id: "lm-dm-002", name: "CICAD (Centre Conférences)",     quartier: "Diamniadio",   type: "loisir",     lat: 14.7150, lng: -17.1810, zone_id: "zone-diamniadio" },
  { id: "lm-dm-003", name: "Gare TER Diamniadio",            quartier: "Diamniadio",   type: "transport",  lat: 14.7135, lng: -17.1835, zone_id: "zone-diamniadio" },
  { id: "lm-dm-004", name: "Stade Abdoulaye Wade",           quartier: "Diamniadio",   type: "loisir",     lat: 14.7100, lng: -17.1780, zone_id: "zone-diamniadio" },
  { id: "lm-dm-005", name: "Parc des Technologies Dakar",   quartier: "Diamniadio",   type: "éducation",  lat: 14.7160, lng: -17.1800, zone_id: "zone-diamniadio" },
  { id: "lm-dm-006", name: "Zone Franche Industrielle",     quartier: "Diamniadio",   type: "commerce",   lat: 14.7080, lng: -17.1750, zone_id: "zone-diamniadio" },
  { id: "lm-dm-007", name: "Mosquée de Diamniadio",         quartier: "Diamniadio",   type: "culte",      lat: 14.7140, lng: -17.1845, zone_id: "zone-diamniadio" },
  { id: "lm-dm-008", name: "Hôpital de Diamniadio",         quartier: "Diamniadio",   type: "santé",      lat: 14.7125, lng: -17.1795, zone_id: "zone-diamniadio" },

  // ══════════════════════════════════════════════════════════════════
  //  THIÈS — Région Thiès                  zone: zone-thies-centre / zone-thies-ism
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-th-001", name: "Grand Marché de Thiès",          quartier: "Centre",       type: "commerce",   lat: 14.7900, lng: -16.9320, zone_id: "zone-thies-centre" },
  { id: "lm-th-002", name: "Place de France Thiès",          quartier: "Centre",       type: "loisir",     lat: 14.7940, lng: -16.9350, zone_id: "zone-thies-centre" },
  { id: "lm-th-003", name: "Promenade des Thiessois",        quartier: "Centre",       type: "loisir",     lat: 14.7955, lng: -16.9335, zone_id: "zone-thies-centre" },
  { id: "lm-th-004", name: "Hôpital Régional de Thiès",     quartier: "Centre",       type: "santé",      lat: 14.7870, lng: -16.9380, zone_id: "zone-thies-centre" },
  { id: "lm-th-005", name: "Gare de Thiès",                  quartier: "Centre",       type: "transport",  lat: 14.7956, lng: -16.9267, zone_id: "zone-thies-centre" },
  { id: "lm-th-006", name: "Gare Routière de Thiès",         quartier: "Centre",       type: "transport",  lat: 14.7880, lng: -16.9290, zone_id: "zone-thies-centre" },
  { id: "lm-th-007", name: "Mosquée Baye Laye Thiès",        quartier: "Centre",       type: "culte",      lat: 14.7920, lng: -16.9290, zone_id: "zone-thies-centre" },
  { id: "lm-th-008", name: "Stade Municipal de Thiès",       quartier: "Centre",       type: "loisir",     lat: 14.7915, lng: -16.9360, zone_id: "zone-thies-centre" },
  { id: "lm-th-009", name: "Lycée Malick Sy Thiès",          quartier: "Centre",       type: "éducation",  lat: 14.7930, lng: -16.9280, zone_id: "zone-thies-centre" },
  { id: "lm-th-010", name: "Cité Malick Sy",                 quartier: "Cité Malick Sy",type:"commerce",   lat: 14.7870, lng: -16.9200, zone_id: "zone-thies-centre" },
  { id: "lm-th-011", name: "Palais des Arts de Thiès",       quartier: "Centre",       type: "loisir",     lat: 14.7912, lng: -16.9350, zone_id: "zone-thies-centre" },
  { id: "lm-th-012", name: "Pharmacie Centrale Thiès",       quartier: "Centre",       type: "santé",      lat: 14.7935, lng: -16.9310, zone_id: "zone-thies-centre" },
  { id: "lm-th-013", name: "ISM Thiès",                      quartier: "Escale",       type: "éducation",  lat: 14.7986, lng: -16.9200, zone_id: "zone-thies-ism" },
  { id: "lm-th-014", name: "Université Iba Der Thiam (UIDT)",quartier: "Escale",       type: "éducation",  lat: 14.8020, lng: -16.9150, zone_id: "zone-thies-ism" },
  { id: "lm-th-015", name: "Marché Escale Thiès",            quartier: "Escale",       type: "commerce",   lat: 14.7985, lng: -16.9240, zone_id: "zone-thies-ism" },
  { id: "lm-th-016", name: "Quartier Escale Thiès",          quartier: "Escale",       type: "commerce",   lat: 14.7975, lng: -16.9220, zone_id: "zone-thies-ism" },
  { id: "lm-th-017", name: "Total Thiès Escale",             quartier: "Escale",       type: "transport",  lat: 14.7960, lng: -16.9230, zone_id: "zone-thies-ism" },
  { id: "lm-th-018", name: "Marché Sor Thiès",               quartier: "Escale",       type: "commerce",   lat: 14.7960, lng: -16.9200, zone_id: "zone-thies-ism" },

  // ══════════════════════════════════════════════════════════════════
  //  TIVAOUANE — Région Thiès              zone: zone-tivaouane
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-tv-001", name: "Mosquée Omarienne de Tivaouane", quartier: "Tivaouane",    type: "culte",      lat: 14.9518, lng: -16.8208, zone_id: "zone-tivaouane" },
  { id: "lm-tv-002", name: "Marché Central de Tivaouane",    quartier: "Tivaouane",    type: "commerce",   lat: 14.9525, lng: -16.8195, zone_id: "zone-tivaouane" },
  { id: "lm-tv-003", name: "Gare routière de Tivaouane",     quartier: "Tivaouane",    type: "transport",  lat: 14.9510, lng: -16.8220, zone_id: "zone-tivaouane" },
  { id: "lm-tv-004", name: "Hôpital de Tivaouane",           quartier: "Tivaouane",    type: "santé",      lat: 14.9530, lng: -16.8210, zone_id: "zone-tivaouane" },
  { id: "lm-tv-005", name: "Cité Serigne Babacar Sy",        quartier: "Tivaouane",    type: "loisir",     lat: 14.9515, lng: -16.8200, zone_id: "zone-tivaouane" },
  { id: "lm-tv-006", name: "Grande Zawiya de Tivaouane",     quartier: "Tivaouane",    type: "culte",      lat: 14.9520, lng: -16.8205, zone_id: "zone-tivaouane" },
  { id: "lm-tv-007", name: "Lycée de Tivaouane",             quartier: "Tivaouane",    type: "éducation",  lat: 14.9535, lng: -16.8215, zone_id: "zone-tivaouane" },
  { id: "lm-tv-008", name: "Marché hebdomadaire Tivaouane",  quartier: "Tivaouane",    type: "commerce",   lat: 14.9535, lng: -16.8190, zone_id: "zone-tivaouane" },

  // ══════════════════════════════════════════════════════════════════
  //  MBOUR / SALY — Petite Côte            zone: zone-mbour / zone-saly
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-mb-001", name: "Grand Marché de Mbour",          quartier: "Centre",       type: "commerce",   lat: 14.3674, lng: -16.9657, zone_id: "zone-mbour" },
  { id: "lm-mb-002", name: "Gare Routière de Mbour",         quartier: "Centre",       type: "transport",  lat: 14.3700, lng: -16.9680, zone_id: "zone-mbour" },
  { id: "lm-mb-003", name: "Hôpital Régional de Mbour",      quartier: "Centre",       type: "santé",      lat: 14.3650, lng: -16.9710, zone_id: "zone-mbour" },
  { id: "lm-mb-004", name: "Port de pêche de Mbour",         quartier: "Sérère",       type: "transport",  lat: 14.3615, lng: -16.9590, zone_id: "zone-mbour" },
  { id: "lm-mb-005", name: "Mosquée Centrale de Mbour",      quartier: "Centre",       type: "culte",      lat: 14.3670, lng: -16.9650, zone_id: "zone-mbour" },
  { id: "lm-mb-006", name: "Stade de Mbour",                 quartier: "Centre",       type: "loisir",     lat: 14.3660, lng: -16.9630, zone_id: "zone-mbour" },
  { id: "lm-mb-007", name: "Lycée Mbour Centre",             quartier: "Centre",       type: "éducation",  lat: 14.3680, lng: -16.9700, zone_id: "zone-mbour" },
  { id: "lm-mb-008", name: "Total Mbour Centre",             quartier: "Centre",       type: "transport",  lat: 14.3690, lng: -16.9670, zone_id: "zone-mbour" },
  { id: "lm-mb-009", name: "Marché Mbour Escale",            quartier: "Escale",       type: "commerce",   lat: 14.3710, lng: -16.9660, zone_id: "zone-mbour" },
  { id: "lm-mb-010", name: "Saly Center",                    quartier: "Saly",         type: "commerce",   lat: 14.4586, lng: -17.0158, zone_id: "zone-saly" },
  { id: "lm-mb-011", name: "Saly Portudal",                  quartier: "Saly",         type: "loisir",     lat: 14.4540, lng: -17.0200, zone_id: "zone-saly" },
  { id: "lm-mb-012", name: "Rond-point Ngaparou",            quartier: "Ngaparou",     type: "transport",  lat: 14.4480, lng: -17.0120, zone_id: "zone-saly" },
  { id: "lm-mb-013", name: "Village de Ngaparou",            quartier: "Ngaparou",     type: "commerce",   lat: 14.4470, lng: -17.0105, zone_id: "zone-saly" },
  { id: "lm-mb-014", name: "Plage de Saly",                  quartier: "Saly",         type: "loisir",     lat: 14.4600, lng: -17.0210, zone_id: "zone-saly" },
  { id: "lm-mb-015", name: "Marché artisanal de Saly",       quartier: "Saly",         type: "commerce",   lat: 14.4565, lng: -17.0170, zone_id: "zone-saly" },

  // ══════════════════════════════════════════════════════════════════
  //  SAINT-LOUIS — Région Saint-Louis      zone: zone-stlouis / zone-stlouis-sud
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-sl-001", name: "Pont Faidherbe",                  quartier: "Ndar",         type: "transport",  lat: 16.0261, lng: -16.4977, zone_id: "zone-stlouis" },
  { id: "lm-sl-002", name: "Place Faidherbe",                 quartier: "Ndar",         type: "loisir",     lat: 16.0265, lng: -16.4970, zone_id: "zone-stlouis" },
  { id: "lm-sl-003", name: "Île de Ndar — Gouvernance",       quartier: "Ndar",         type: "commerce",   lat: 16.0270, lng: -16.4960, zone_id: "zone-stlouis" },
  { id: "lm-sl-004", name: "Grande Mosquée de Saint-Louis",   quartier: "Ndar",         type: "culte",      lat: 16.0268, lng: -16.4958, zone_id: "zone-stlouis" },
  { id: "lm-sl-005", name: "Hôpital Régional de Saint-Louis", quartier: "Ndar",         type: "santé",      lat: 16.0230, lng: -16.4970, zone_id: "zone-stlouis" },
  { id: "lm-sl-006", name: "Marché Octave Diallo",            quartier: "Ndar",         type: "commerce",   lat: 16.0250, lng: -16.4980, zone_id: "zone-stlouis" },
  { id: "lm-sl-007", name: "Gare de Saint-Louis",             quartier: "Ndar",         type: "transport",  lat: 16.0200, lng: -16.4900, zone_id: "zone-stlouis" },
  { id: "lm-sl-008", name: "Cathédrale de Saint-Louis",       quartier: "Ndar",         type: "culte",      lat: 16.0255, lng: -16.4972, zone_id: "zone-stlouis" },
  { id: "lm-sl-009", name: "Lycée Charles de Gaulle",         quartier: "Ndar",         type: "éducation",  lat: 16.0240, lng: -16.4950, zone_id: "zone-stlouis" },
  { id: "lm-sl-010", name: "Quartier Léona",                  quartier: "Léona",        type: "commerce",   lat: 16.0290, lng: -16.4980, zone_id: "zone-stlouis" },
  { id: "lm-sl-011", name: "Hydrobase — Langue de Barbarie",  quartier: "Hydrobase",    type: "loisir",     lat: 16.0150, lng: -16.5100, zone_id: "zone-stlouis-sud" },
  { id: "lm-sl-012", name: "Marché de Sor",                   quartier: "Sor",          type: "commerce",   lat: 16.0180, lng: -16.5080, zone_id: "zone-stlouis-sud" },
  { id: "lm-sl-013", name: "Faubourg Sor",                    quartier: "Sor",          type: "transport",  lat: 16.0100, lng: -16.5020, zone_id: "zone-stlouis-sud" },
  { id: "lm-sl-014", name: "Université Gaston Berger (UGB)",  quartier: "UGB",          type: "éducation",  lat: 16.0490, lng: -16.4608, zone_id: "zone-stlouis-sud" },
  { id: "lm-sl-015", name: "Gare routière de Sor",            quartier: "Sor",          type: "transport",  lat: 16.0170, lng: -16.5070, zone_id: "zone-stlouis-sud" },
  { id: "lm-sl-016", name: "Ndioloffène",                     quartier: "Ndioloffène",  type: "commerce",   lat: 16.0320, lng: -16.4890, zone_id: "zone-stlouis" },
  { id: "lm-sl-017", name: "Sanar (quartier universitaire)",  quartier: "Sanar",        type: "éducation",  lat: 16.0420, lng: -16.4680, zone_id: "zone-stlouis-sud" },
  { id: "lm-sl-018", name: "Total Sor Saint-Louis",           quartier: "Sor",          type: "transport",  lat: 16.0185, lng: -16.5060, zone_id: "zone-stlouis-sud" },

  // ══════════════════════════════════════════════════════════════════
  //  TOUBA / MBACKÉ — Région Diourbel      zone: zone-touba / zone-mbacke
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-tb-001", name: "Grande Mosquée de Touba",         quartier: "Centre",       type: "culte",      lat: 14.8504, lng: -15.8878, zone_id: "zone-touba" },
  { id: "lm-tb-002", name: "Marché Ocass de Touba",           quartier: "Centre",       type: "commerce",   lat: 14.8520, lng: -15.8900, zone_id: "zone-touba" },
  { id: "lm-tb-003", name: "Mausolée Cheikh Ahmadou Bamba",   quartier: "Centre",       type: "culte",      lat: 14.8510, lng: -15.8885, zone_id: "zone-touba" },
  { id: "lm-tb-004", name: "Gare routière de Touba",          quartier: "Centre",       type: "transport",  lat: 14.8480, lng: -15.8850, zone_id: "zone-touba" },
  { id: "lm-tb-005", name: "Hôpital Matlaboul Fawzeyni",      quartier: "Centre",       type: "santé",      lat: 14.8535, lng: -15.8910, zone_id: "zone-touba" },
  { id: "lm-tb-006", name: "Darou Marnane",                   quartier: "Darou Marnane",type: "culte",      lat: 14.8450, lng: -15.8820, zone_id: "zone-touba" },
  { id: "lm-tb-007", name: "Quartier Palène",                 quartier: "Palène",       type: "commerce",   lat: 14.8530, lng: -15.8950, zone_id: "zone-touba" },
  { id: "lm-tb-008", name: "Marché Keur Niang Touba",         quartier: "Keur Niang",   type: "commerce",   lat: 14.8495, lng: -15.8870, zone_id: "zone-touba" },
  { id: "lm-tb-009", name: "Lycée de Touba",                  quartier: "Centre",       type: "éducation",  lat: 14.8515, lng: -15.8865, zone_id: "zone-touba" },
  { id: "lm-tb-010", name: "Mbacké Centre-ville",             quartier: "Mbacké",       type: "commerce",   lat: 14.8009, lng: -15.9104, zone_id: "zone-mbacke" },
  { id: "lm-tb-011", name: "Gare routière de Mbacké",         quartier: "Mbacké",       type: "transport",  lat: 14.8020, lng: -15.9080, zone_id: "zone-mbacke" },
  { id: "lm-tb-012", name: "Marché de Mbacké",                quartier: "Mbacké",       type: "commerce",   lat: 14.8015, lng: -15.9120, zone_id: "zone-mbacke" },
  { id: "lm-tb-013", name: "Hôpital de Mbacké",               quartier: "Mbacké",       type: "santé",      lat: 14.8005, lng: -15.9095, zone_id: "zone-mbacke" },
  { id: "lm-tb-014", name: "Grande Mosquée de Mbacké",        quartier: "Mbacké",       type: "culte",      lat: 14.8010, lng: -15.9110, zone_id: "zone-mbacke" },
  { id: "lm-tb-015", name: "Lycée Gaston Berger Mbacké",      quartier: "Mbacké",       type: "éducation",  lat: 14.8030, lng: -15.9090, zone_id: "zone-mbacke" },

  // ══════════════════════════════════════════════════════════════════
  //  DIOURBEL — Région Diourbel            zone: zone-diourbel
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-db-001", name: "Marché Central de Diourbel",      quartier: "Centre",       type: "commerce",   lat: 14.6540, lng: -16.2310, zone_id: "zone-diourbel" },
  { id: "lm-db-002", name: "Hôpital Régional de Diourbel",    quartier: "Centre",       type: "santé",      lat: 14.6550, lng: -16.2300, zone_id: "zone-diourbel" },
  { id: "lm-db-003", name: "Gare routière de Diourbel",       quartier: "Centre",       type: "transport",  lat: 14.6530, lng: -16.2330, zone_id: "zone-diourbel" },
  { id: "lm-db-004", name: "Grande Mosquée de Diourbel",      quartier: "Centre",       type: "culte",      lat: 14.6545, lng: -16.2315, zone_id: "zone-diourbel" },
  { id: "lm-db-005", name: "Gouvernance de Diourbel",         quartier: "Centre",       type: "commerce",   lat: 14.6555, lng: -16.2320, zone_id: "zone-diourbel" },
  { id: "lm-db-006", name: "Lycée Valdiodio Ndiaye",          quartier: "Centre",       type: "éducation",  lat: 14.6535, lng: -16.2295, zone_id: "zone-diourbel" },
  { id: "lm-db-007", name: "Stade Municipal Diourbel",        quartier: "Centre",       type: "loisir",     lat: 14.6525, lng: -16.2340, zone_id: "zone-diourbel" },
  { id: "lm-db-008", name: "Marché Thiénaba Diourbel",        quartier: "Thiénaba",     type: "commerce",   lat: 14.6560, lng: -16.2280, zone_id: "zone-diourbel" },

  // ══════════════════════════════════════════════════════════════════
  //  KAOLACK — Région Kaolack              zone: zone-kaolack
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-kl-001", name: "Marché Central de Kaolack",       quartier: "Centre",       type: "commerce",   lat: 14.1652, lng: -16.0726, zone_id: "zone-kaolack" },
  { id: "lm-kl-002", name: "Grande Mosquée de Kaolack",       quartier: "Centre",       type: "culte",      lat: 14.1660, lng: -16.0720, zone_id: "zone-kaolack" },
  { id: "lm-kl-003", name: "Gare routière de Kaolack",        quartier: "Centre",       type: "transport",  lat: 14.1600, lng: -16.0680, zone_id: "zone-kaolack" },
  { id: "lm-kl-004", name: "Hôpital Régional de Kaolack",     quartier: "Centre",       type: "santé",      lat: 14.1700, lng: -16.0750, zone_id: "zone-kaolack" },
  { id: "lm-kl-005", name: "Quartier Ndorong",                quartier: "Ndorong",      type: "commerce",   lat: 14.1730, lng: -16.0760, zone_id: "zone-kaolack" },
  { id: "lm-kl-006", name: "Pont de Kaolack",                 quartier: "Léona",        type: "transport",  lat: 14.1580, lng: -16.0690, zone_id: "zone-kaolack" },
  { id: "lm-kl-007", name: "Stade Lamine Guèye Kaolack",      quartier: "Centre",       type: "loisir",     lat: 14.1620, lng: -16.0720, zone_id: "zone-kaolack" },
  { id: "lm-kl-008", name: "Université Sine-Saloum El-Hadj Ibrahima Niass", quartier: "Léona",type:"éducation", lat: 14.1750, lng: -16.0800, zone_id: "zone-kaolack" },
  { id: "lm-kl-009", name: "Port fluvial de Kaolack",         quartier: "Port",         type: "transport",  lat: 14.1560, lng: -16.0650, zone_id: "zone-kaolack" },
  { id: "lm-kl-010", name: "Cathédrale de Kaolack",           quartier: "Centre",       type: "culte",      lat: 14.1645, lng: -16.0715, zone_id: "zone-kaolack" },
  { id: "lm-kl-011", name: "Quartier Léona Kaolack",          quartier: "Léona",        type: "commerce",   lat: 14.1650, lng: -16.0740, zone_id: "zone-kaolack" },
  { id: "lm-kl-012", name: "Total Kaolack Centre",            quartier: "Centre",       type: "transport",  lat: 14.1640, lng: -16.0730, zone_id: "zone-kaolack" },
  { id: "lm-kl-013", name: "Marché Bongre Kaolack",           quartier: "Bongre",       type: "commerce",   lat: 14.1670, lng: -16.0760, zone_id: "zone-kaolack" },

  // ══════════════════════════════════════════════════════════════════
  //  FATICK — Région Fatick                zone: zone-fatick
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-ft-001", name: "Marché Central de Fatick",        quartier: "Centre",       type: "commerce",   lat: 14.3345, lng: -16.4083, zone_id: "zone-fatick" },
  { id: "lm-ft-002", name: "Hôpital Régional de Fatick",      quartier: "Centre",       type: "santé",      lat: 14.3360, lng: -16.4070, zone_id: "zone-fatick" },
  { id: "lm-ft-003", name: "Gare de Fatick",                  quartier: "Centre",       type: "transport",  lat: 14.3330, lng: -16.4090, zone_id: "zone-fatick" },
  { id: "lm-ft-004", name: "Gouvernance de Fatick",           quartier: "Centre",       type: "commerce",   lat: 14.3350, lng: -16.4080, zone_id: "zone-fatick" },
  { id: "lm-ft-005", name: "Mosquée Centrale de Fatick",      quartier: "Centre",       type: "culte",      lat: 14.3345, lng: -16.4085, zone_id: "zone-fatick" },
  { id: "lm-ft-006", name: "Lycée de Fatick",                 quartier: "Centre",       type: "éducation",  lat: 14.3370, lng: -16.4065, zone_id: "zone-fatick" },
  { id: "lm-ft-007", name: "Gare routière de Fatick",         quartier: "Centre",       type: "transport",  lat: 14.3340, lng: -16.4095, zone_id: "zone-fatick" },
  { id: "lm-ft-008", name: "Stade Municipal de Fatick",       quartier: "Centre",       type: "loisir",     lat: 14.3355, lng: -16.4100, zone_id: "zone-fatick" },

  // ══════════════════════════════════════════════════════════════════
  //  KAFFRINE — Région Kaffrine            zone: zone-kaffrine
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-kf-001", name: "Marché Central de Kaffrine",      quartier: "Centre",       type: "commerce",   lat: 14.1055, lng: -15.5508, zone_id: "zone-kaffrine" },
  { id: "lm-kf-002", name: "Hôpital Régional de Kaffrine",    quartier: "Centre",       type: "santé",      lat: 14.1065, lng: -15.5495, zone_id: "zone-kaffrine" },
  { id: "lm-kf-003", name: "Gare routière de Kaffrine",       quartier: "Centre",       type: "transport",  lat: 14.1045, lng: -15.5520, zone_id: "zone-kaffrine" },
  { id: "lm-kf-004", name: "Gouvernance de Kaffrine",         quartier: "Centre",       type: "commerce",   lat: 14.1060, lng: -15.5510, zone_id: "zone-kaffrine" },
  { id: "lm-kf-005", name: "Grande Mosquée de Kaffrine",      quartier: "Centre",       type: "culte",      lat: 14.1058, lng: -15.5505, zone_id: "zone-kaffrine" },
  { id: "lm-kf-006", name: "Lycée de Kaffrine",               quartier: "Centre",       type: "éducation",  lat: 14.1070, lng: -15.5490, zone_id: "zone-kaffrine" },

  // ══════════════════════════════════════════════════════════════════
  //  LOUGA — Région Louga                  zone: zone-louga
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-lo-001", name: "Marché Central de Louga",         quartier: "Centre",       type: "commerce",   lat: 15.6172, lng: -16.2241, zone_id: "zone-louga" },
  { id: "lm-lo-002", name: "Gare de Louga",                   quartier: "Centre",       type: "transport",  lat: 15.6180, lng: -16.2250, zone_id: "zone-louga" },
  { id: "lm-lo-003", name: "Hôpital Régional de Louga",       quartier: "Centre",       type: "santé",      lat: 15.6160, lng: -16.2220, zone_id: "zone-louga" },
  { id: "lm-lo-004", name: "Grande Mosquée de Louga",         quartier: "Centre",       type: "culte",      lat: 15.6175, lng: -16.2235, zone_id: "zone-louga" },
  { id: "lm-lo-005", name: "Lycée Malick Fall Louga",         quartier: "Centre",       type: "éducation",  lat: 15.6185, lng: -16.2260, zone_id: "zone-louga" },
  { id: "lm-lo-006", name: "Gare routière de Louga",          quartier: "Centre",       type: "transport",  lat: 15.6190, lng: -16.2230, zone_id: "zone-louga" },
  { id: "lm-lo-007", name: "Stade Alassane Djigo Louga",      quartier: "Centre",       type: "loisir",     lat: 15.6165, lng: -16.2255, zone_id: "zone-louga" },
  { id: "lm-lo-008", name: "Gouvernance de Louga",            quartier: "Centre",       type: "commerce",   lat: 15.6170, lng: -16.2240, zone_id: "zone-louga" },
  { id: "lm-lo-009", name: "Total Louga Centre",              quartier: "Centre",       type: "transport",  lat: 15.6178, lng: -16.2248, zone_id: "zone-louga" },
  { id: "lm-lo-010", name: "Marché hebdomadaire Louga",       quartier: "Centre",       type: "commerce",   lat: 15.6195, lng: -16.2225, zone_id: "zone-louga" },

  // ══════════════════════════════════════════════════════════════════
  //  MATAM — Région Matam                  zone: zone-matam
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-mt-001", name: "Marché Central de Matam",         quartier: "Centre",       type: "commerce",   lat: 15.6558, lng: -13.2553, zone_id: "zone-matam" },
  { id: "lm-mt-002", name: "Hôpital Régional de Matam",       quartier: "Centre",       type: "santé",      lat: 15.6570, lng: -13.2540, zone_id: "zone-matam" },
  { id: "lm-mt-003", name: "Gare routière de Matam",          quartier: "Centre",       type: "transport",  lat: 15.6545, lng: -13.2565, zone_id: "zone-matam" },
  { id: "lm-mt-004", name: "Gouvernance de Matam",            quartier: "Centre",       type: "commerce",   lat: 15.6560, lng: -13.2550, zone_id: "zone-matam" },
  { id: "lm-mt-005", name: "Grande Mosquée de Matam",         quartier: "Centre",       type: "culte",      lat: 15.6555, lng: -13.2558, zone_id: "zone-matam" },
  { id: "lm-mt-006", name: "Lycée de Matam",                  quartier: "Centre",       type: "éducation",  lat: 15.6575, lng: -13.2535, zone_id: "zone-matam" },
  { id: "lm-mt-007", name: "Université du Sahel Matam",       quartier: "Centre",       type: "éducation",  lat: 15.6540, lng: -13.2570, zone_id: "zone-matam" },
  { id: "lm-mt-008", name: "Fleuve Sénégal — Berge Matam",    quartier: "Berge",        type: "loisir",     lat: 15.6580, lng: -13.2520, zone_id: "zone-matam" },

  // ══════════════════════════════════════════════════════════════════
  //  PODOR — Région Matam                  zone: zone-podor
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-pd-001", name: "Marché de Podor",                 quartier: "Podor",        type: "commerce",   lat: 16.6499, lng: -14.9584, zone_id: "zone-podor" },
  { id: "lm-pd-002", name: "Hôpital de Podor",                quartier: "Podor",        type: "santé",      lat: 16.6510, lng: -14.9570, zone_id: "zone-podor" },
  { id: "lm-pd-003", name: "Gare routière de Podor",          quartier: "Podor",        type: "transport",  lat: 16.6485, lng: -14.9600, zone_id: "zone-podor" },
  { id: "lm-pd-004", name: "Gouvernance de Podor",            quartier: "Podor",        type: "commerce",   lat: 16.6500, lng: -14.9580, zone_id: "zone-podor" },
  { id: "lm-pd-005", name: "Fort de Podor",                   quartier: "Podor",        type: "loisir",     lat: 16.6492, lng: -14.9592, zone_id: "zone-podor" },
  { id: "lm-pd-006", name: "Fleuve Sénégal — Berge Podor",    quartier: "Berge",        type: "loisir",     lat: 16.6520, lng: -14.9560, zone_id: "zone-podor" },

  // ══════════════════════════════════════════════════════════════════
  //  RICHARD TOLL — Région Saint-Louis     zone: zone-richard-toll
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-rt-001", name: "CSS — Compagnie Sucrière du Sénégal", quartier: "CSS",     type: "commerce",   lat: 16.4607, lng: -15.6973, zone_id: "zone-richard-toll" },
  { id: "lm-rt-002", name: "Marché Central Richard Toll",     quartier: "Richard Toll", type: "commerce",   lat: 16.4620, lng: -15.6960, zone_id: "zone-richard-toll" },
  { id: "lm-rt-003", name: "Gare de Richard Toll",            quartier: "Richard Toll", type: "transport",  lat: 16.4595, lng: -15.6985, zone_id: "zone-richard-toll" },
  { id: "lm-rt-004", name: "Hôpital de Richard Toll",         quartier: "Richard Toll", type: "santé",      lat: 16.4610, lng: -15.6965, zone_id: "zone-richard-toll" },
  { id: "lm-rt-005", name: "Pont sur le Lampsar",             quartier: "Richard Toll", type: "transport",  lat: 16.4580, lng: -15.7000, zone_id: "zone-richard-toll" },
  { id: "lm-rt-006", name: "Gare routière Richard Toll",      quartier: "Richard Toll", type: "transport",  lat: 16.4615, lng: -15.6970, zone_id: "zone-richard-toll" },
  { id: "lm-rt-007", name: "Marché hebdomadaire Richard Toll",quartier: "Richard Toll", type: "commerce",   lat: 16.4625, lng: -15.6950, zone_id: "zone-richard-toll" },
  { id: "lm-rt-008", name: "Lycée de Richard Toll",           quartier: "Richard Toll", type: "éducation",  lat: 16.4630, lng: -15.6945, zone_id: "zone-richard-toll" },

  // ══════════════════════════════════════════════════════════════════
  //  TAMBACOUNDA — Région Tambacounda      zone: zone-tambacounda
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-tk-001", name: "Marché Central de Tambacounda",   quartier: "Centre",       type: "commerce",   lat: 13.7708, lng: -13.6669, zone_id: "zone-tambacounda" },
  { id: "lm-tk-002", name: "Gare de Tambacounda",             quartier: "Centre",       type: "transport",  lat: 13.7720, lng: -13.6650, zone_id: "zone-tambacounda" },
  { id: "lm-tk-003", name: "Hôpital Régional de Tambacounda", quartier: "Centre",       type: "santé",      lat: 13.7700, lng: -13.6690, zone_id: "zone-tambacounda" },
  { id: "lm-tk-004", name: "Gare routière de Tambacounda",    quartier: "Centre",       type: "transport",  lat: 13.7730, lng: -13.6640, zone_id: "zone-tambacounda" },
  { id: "lm-tk-005", name: "Stade de Tambacounda",            quartier: "Centre",       type: "loisir",     lat: 13.7690, lng: -13.6680, zone_id: "zone-tambacounda" },
  { id: "lm-tk-006", name: "Lycée Demba Diallo Tambacounda",  quartier: "Centre",       type: "éducation",  lat: 13.7715, lng: -13.6660, zone_id: "zone-tambacounda" },
  { id: "lm-tk-007", name: "Gouvernance de Tambacounda",      quartier: "Centre",       type: "commerce",   lat: 13.7705, lng: -13.6665, zone_id: "zone-tambacounda" },
  { id: "lm-tk-008", name: "Grande Mosquée de Tambacounda",   quartier: "Centre",       type: "culte",      lat: 13.7710, lng: -13.6675, zone_id: "zone-tambacounda" },
  { id: "lm-tk-009", name: "Total Tambacounda Centre",        quartier: "Centre",       type: "transport",  lat: 13.7698, lng: -13.6658, zone_id: "zone-tambacounda" },
  { id: "lm-tk-010", name: "Marché Liberté Tambacounda",      quartier: "Liberté",      type: "commerce",   lat: 13.7725, lng: -13.6680, zone_id: "zone-tambacounda" },

  // ══════════════════════════════════════════════════════════════════
  //  KÉDOUGOU — Région Kédougou            zone: zone-kedougou
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-kd-001", name: "Marché Central de Kédougou",      quartier: "Centre",       type: "commerce",   lat: 12.5597, lng: -12.1772, zone_id: "zone-kedougou" },
  { id: "lm-kd-002", name: "Hôpital Régional de Kédougou",    quartier: "Centre",       type: "santé",      lat: 12.5610, lng: -12.1760, zone_id: "zone-kedougou" },
  { id: "lm-kd-003", name: "Gare routière de Kédougou",       quartier: "Centre",       type: "transport",  lat: 12.5585, lng: -12.1785, zone_id: "zone-kedougou" },
  { id: "lm-kd-004", name: "Gouvernance de Kédougou",         quartier: "Centre",       type: "commerce",   lat: 12.5600, lng: -12.1770, zone_id: "zone-kedougou" },
  { id: "lm-kd-005", name: "Fleuve Gambie — Berge Kédougou",  quartier: "Berge",        type: "loisir",     lat: 12.5580, lng: -12.1790, zone_id: "zone-kedougou" },
  { id: "lm-kd-006", name: "Lycée de Kédougou",               quartier: "Centre",       type: "éducation",  lat: 12.5615, lng: -12.1755, zone_id: "zone-kedougou" },
  { id: "lm-kd-007", name: "Marché hebdomadaire Kédougou",    quartier: "Centre",       type: "commerce",   lat: 12.5590, lng: -12.1780, zone_id: "zone-kedougou" },

  // ══════════════════════════════════════════════════════════════════
  //  ZIGUINCHOR — Région Ziguinchor        zone: zone-ziguinchor
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-zg-001", name: "Marché de l'Escale de Ziguinchor", quartier: "Escale",      type: "commerce",   lat: 12.5636, lng: -16.2728, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-002", name: "Université Assane Seck Ziguinchor",quartier: "Tilène",      type: "éducation",  lat: 12.5700, lng: -16.2800, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-003", name: "Port de Ziguinchor",              quartier: "Port",         type: "transport",  lat: 12.5610, lng: -16.2740, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-004", name: "Hôpital Régional de Ziguinchor",  quartier: "Escale",       type: "santé",      lat: 12.5650, lng: -16.2700, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-005", name: "Gare routière de Ziguinchor",     quartier: "Escale",       type: "transport",  lat: 12.5580, lng: -16.2710, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-006", name: "Cathédrale de Ziguinchor",        quartier: "Escale",       type: "culte",      lat: 12.5630, lng: -16.2720, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-007", name: "Gouvernance de Ziguinchor",       quartier: "Escale",       type: "commerce",   lat: 12.5640, lng: -16.2730, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-008", name: "Quartier Boucotte",               quartier: "Boucotte",     type: "commerce",   lat: 12.5690, lng: -16.2750, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-009", name: "Marché Boudody Ziguinchor",       quartier: "Boudody",      type: "commerce",   lat: 12.5660, lng: -16.2680, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-010", name: "Mosquée Centrale de Ziguinchor",  quartier: "Escale",       type: "culte",      lat: 12.5635, lng: -16.2725, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-011", name: "Lycée Djignabo Ziguinchor",       quartier: "Tilène",       type: "éducation",  lat: 12.5680, lng: -16.2760, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-012", name: "Stade Aline Sitoé Diatta",        quartier: "Escale",       type: "loisir",     lat: 12.5620, lng: -16.2745, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-013", name: "Fleuve Casamance — Berge",        quartier: "Berge",        type: "loisir",     lat: 12.5600, lng: -16.2760, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-014", name: "Institut Polytechnique Ziguinchor",quartier: "Tilène",      type: "éducation",  lat: 12.5550, lng: -16.2780, zone_id: "zone-ziguinchor" },
  { id: "lm-zg-015", name: "Total Ziguinchor Escale",         quartier: "Escale",       type: "transport",  lat: 12.5628, lng: -16.2718, zone_id: "zone-ziguinchor" },

  // ══════════════════════════════════════════════════════════════════
  //  KOLDA — Région Kolda                  zone: zone-kolda
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-kk-001", name: "Marché Central de Kolda",         quartier: "Centre",       type: "commerce",   lat: 12.8978, lng: -14.9408, zone_id: "zone-kolda" },
  { id: "lm-kk-002", name: "Hôpital Régional de Kolda",       quartier: "Centre",       type: "santé",      lat: 12.8990, lng: -14.9395, zone_id: "zone-kolda" },
  { id: "lm-kk-003", name: "Gare routière de Kolda",          quartier: "Centre",       type: "transport",  lat: 12.8965, lng: -14.9420, zone_id: "zone-kolda" },
  { id: "lm-kk-004", name: "Gouvernance de Kolda",            quartier: "Centre",       type: "commerce",   lat: 12.8980, lng: -14.9405, zone_id: "zone-kolda" },
  { id: "lm-kk-005", name: "Grande Mosquée de Kolda",         quartier: "Centre",       type: "culte",      lat: 12.8975, lng: -14.9412, zone_id: "zone-kolda" },
  { id: "lm-kk-006", name: "Lycée Thierno Souleymane Baal",   quartier: "Centre",       type: "éducation",  lat: 12.8995, lng: -14.9390, zone_id: "zone-kolda" },
  { id: "lm-kk-007", name: "Fleuve Casamance — Kolda",        quartier: "Berge",        type: "loisir",     lat: 12.8960, lng: -14.9430, zone_id: "zone-kolda" },
  { id: "lm-kk-008", name: "Marché hebdomadaire Kolda",       quartier: "Centre",       type: "commerce",   lat: 12.8985, lng: -14.9400, zone_id: "zone-kolda" },

  // ══════════════════════════════════════════════════════════════════
  //  SÉDHIOU — Région Sédhiou              zone: zone-sedhiou
  // ══════════════════════════════════════════════════════════════════
  { id: "lm-sd-001", name: "Marché Central de Sédhiou",       quartier: "Centre",       type: "commerce",   lat: 12.7082, lng: -15.5574, zone_id: "zone-sedhiou" },
  { id: "lm-sd-002", name: "Hôpital Régional de Sédhiou",     quartier: "Centre",       type: "santé",      lat: 12.7095, lng: -15.5560, zone_id: "zone-sedhiou" },
  { id: "lm-sd-003", name: "Gare routière de Sédhiou",        quartier: "Centre",       type: "transport",  lat: 12.7070, lng: -15.5590, zone_id: "zone-sedhiou" },
  { id: "lm-sd-004", name: "Gouvernance de Sédhiou",          quartier: "Centre",       type: "commerce",   lat: 12.7085, lng: -15.5570, zone_id: "zone-sedhiou" },
  { id: "lm-sd-005", name: "Grande Mosquée de Sédhiou",       quartier: "Centre",       type: "culte",      lat: 12.7080, lng: -15.5578, zone_id: "zone-sedhiou" },
  { id: "lm-sd-006", name: "Lycée de Sédhiou",                quartier: "Centre",       type: "éducation",  lat: 12.7100, lng: -15.5555, zone_id: "zone-sedhiou" },
  { id: "lm-sd-007", name: "Fleuve Casamance — Sédhiou",      quartier: "Berge",        type: "loisir",     lat: 12.7065, lng: -15.5595, zone_id: "zone-sedhiou" },
  { id: "lm-sd-008", name: "Marché Abéné Sédhiou",            quartier: "Abéné",        type: "commerce",   lat: 12.7090, lng: -15.5565, zone_id: "zone-sedhiou" },
];

export function searchLandmarks(query: string, limit = 6): Landmark[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return landmarks
    .filter((l) => l.name.toLowerCase().includes(q) || l.quartier.toLowerCase().includes(q))
    .slice(0, limit);
}

export function getLandmarksByZone(zoneId: string): Landmark[] {
  return landmarks.filter((l) => l.zone_id === zoneId);
}
