const BASE_URL = "https://api.football-data.org/v4";

export type ApiScoreSide = { home: number | null; away: number | null };

export type ApiMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: { id: number | null; name: string | null; crest: string | null };
  awayTeam: { id: number | null; name: string | null; crest: string | null };
  score: {
    winner: string | null;
    duration: string;
    fullTime: ApiScoreSide;
    regularTime?: ApiScoreSide | null;
    extraTime?: ApiScoreSide | null;
    penalties?: ApiScoreSide | null;
  };
};

export type ApiMatchesResponse = {
  resultSet?: { count: number };
  matches: ApiMatch[];
};

export async function fetchWorldCupMatches(): Promise<ApiMatchesResponse> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    throw new Error(
      "FOOTBALL_DATA_TOKEN não configurado — defina no arquivo .env"
    );
  }
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Football-Data respondeu ${res.status}: ${body.slice(0, 300)}`
    );
  }
  return (await res.json()) as ApiMatchesResponse;
}
