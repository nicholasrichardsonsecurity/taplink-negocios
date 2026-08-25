import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  sql,
} from "drizzle-orm";
import { db } from "@/packages/database/client";
import { analyticsEvents } from "@/packages/database/schema";

export function analyticsDays(value: unknown) {
  const days = Number(value);
  return [7, 30, 90].includes(days) ? days : 30;
}
export async function getAnalyticsReport(organizationId: string, days: number) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - days + 1);
  const where = and(
    eq(analyticsEvents.organizationId, organizationId),
    gte(analyticsEvents.occurredAt, since),
  );
  const [[views], [actions], [visitors], byAction, bySource, rawDaily] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(analyticsEvents)
        .where(and(where, eq(analyticsEvents.eventType, "page_view"))),
      db
        .select({ value: count() })
        .from(analyticsEvents)
        .where(and(where, eq(analyticsEvents.eventType, "action_click"))),
      db
        .select({ value: countDistinct(analyticsEvents.visitorHash) })
        .from(analyticsEvents)
        .where(where),
      db
        .select({ label: analyticsEvents.action, value: count() })
        .from(analyticsEvents)
        .where(and(where, eq(analyticsEvents.eventType, "action_click")))
        .groupBy(analyticsEvents.action)
        .orderBy(desc(count())),
      db
        .select({ label: analyticsEvents.source, value: count() })
        .from(analyticsEvents)
        .where(where)
        .groupBy(analyticsEvents.source)
        .orderBy(desc(count())),
      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${analyticsEvents.occurredAt}), 'YYYY-MM-DD')`,
          eventType: analyticsEvents.eventType,
          value: count(),
        })
        .from(analyticsEvents)
        .where(where)
        .groupBy(
          sql`date_trunc('day', ${analyticsEvents.occurredAt})`,
          analyticsEvents.eventType,
        )
        .orderBy(asc(sql`date_trunc('day', ${analyticsEvents.occurredAt})`)),
    ]);
  const indexed = new Map(
    rawDaily.map((row) => [`${row.day}:${row.eventType}`, Number(row.value)]),
  );
  const daily = [];
  for (let offset = 0; offset < days; offset++) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + offset);
    const day = date.toISOString().slice(0, 10);
    daily.push({
      day,
      views: indexed.get(`${day}:page_view`) ?? 0,
      actions: indexed.get(`${day}:action_click`) ?? 0,
    });
  }
  return {
    period: { days, since: since.toISOString() },
    totals: {
      views: Number(views.value),
      actions: Number(actions.value),
      visitors: Number(visitors.value),
      conversion: Number(views.value)
        ? Math.round((Number(actions.value) / Number(views.value)) * 1000) / 10
        : 0,
    },
    byAction: byAction.map((row) => ({
      label: row.label ?? "Outro",
      value: Number(row.value),
    })),
    bySource: bySource.map((row) => ({
      label: row.label,
      value: Number(row.value),
    })),
    daily,
  };
}
