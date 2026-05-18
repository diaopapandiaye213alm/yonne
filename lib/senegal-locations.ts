export interface SenegalCity {
  name: string;
  commune?: string;
}

export interface SenegalRegion {
  name: string;
  cities: string[];
}

export const SENEGAL_REGIONS: SenegalRegion[] = [
  {
    name: "Dakar",
    cities: [
      "Dakar", "Pikine", "Guédiawaye", "Rufisque", "Bargny",
      "Sébikotane", "Sangalkam", "Yenne", "Diamniadio", "Thiès",
    ],
  },
  {
    name: "Thiès",
    cities: [
      "Thiès", "Mbour", "Tivaouane", "Joal-Fadiouth", "Pout",
      "Khombole", "Mboro", "Ngaparou", "Saly",
    ],
  },
  {
    name: "Saint-Louis",
    cities: [
      "Saint-Louis", "Dagana", "Podor", "Richard-Toll", "Mpal",
      "Ndioum", "Rosso-Sénégal",
    ],
  },
  {
    name: "Diourbel",
    cities: ["Diourbel", "Touba", "Mbacké", "Bambey", "Ndame"],
  },
  {
    name: "Kaolack",
    cities: ["Kaolack", "Guinguinéo", "Nioro du Rip", "Koungheul"],
  },
  {
    name: "Ziguinchor",
    cities: [
      "Ziguinchor", "Bignona", "Oussouye", "Cap Skirring", "Kafountine",
    ],
  },
  {
    name: "Louga",
    cities: ["Louga", "Linguère", "Kébémer", "Dahra"],
  },
  {
    name: "Fatick",
    cities: ["Fatick", "Foundiougne", "Gossas", "Sokone", "Karang"],
  },
  {
    name: "Kolda",
    cities: ["Kolda", "Vélingara", "Médina Yoro Foulah", "Diaobé"],
  },
  {
    name: "Tambacounda",
    cities: ["Tambacounda", "Bakel", "Goudiry", "Koumpentoum", "Kidira"],
  },
  {
    name: "Kédougou",
    cities: ["Kédougou", "Salémata", "Saraya", "Fongolimbi"],
  },
  {
    name: "Matam",
    cities: ["Matam", "Kanel", "Ranérou", "Ourossogui"],
  },
  {
    name: "Sédhiou",
    cities: ["Sédhiou", "Bounkiling", "Goudomp", "Marsassoum"],
  },
  {
    name: "Kaffrine",
    cities: ["Kaffrine", "Birkilane", "Koungheul", "Malem Hodar"],
  },
];

/** All city names as a flat list, deduplicated. */
export const ALL_CITIES: string[] = Array.from(
  new Set(SENEGAL_REGIONS.flatMap(r => r.cities))
).sort((a, b) => a.localeCompare(b, "fr"));

/** Cities for a given region name. */
export function citiesForRegion(regionName: string): string[] {
  return SENEGAL_REGIONS.find(r => r.name === regionName)?.cities ?? [];
}
