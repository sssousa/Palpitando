const TIME_ZONE = "America/Sao_Paulo";

export function formatDayHeading(date: Date): string {
  const text = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Chave AAAA-MM-DD do dia no fuso de Brasília, para agrupar jogos. */
export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Fase de grupos",
  LAST_32: "16-avos de final",
  LAST_16: "Oitavas de final",
  QUARTER_FINALS: "Quartas de final",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Disputa de 3º lugar",
  FINAL: "Final",
};

export function stageLabel(stage: string, groupName?: string | null): string {
  if (stage === "GROUP_STAGE" && groupName) {
    return groupName.replace("Group", "Grupo");
  }
  return STAGE_LABELS[stage] ?? stage;
}

export const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Agendado",
  TIMED: "Agendado",
  IN_PLAY: "Em andamento",
  PAUSED: "Intervalo",
  FINISHED: "Encerrado",
  SUSPENDED: "Suspenso",
  POSTPONED: "Adiado",
  CANCELLED: "Cancelado",
  AWARDED: "Resultado decretado",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
