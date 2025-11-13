import { differenceInCalendarDays, isAfter, isBefore, startOfToday } from "date-fns";
import type { ContactRecord } from "@/types/crm";

interface CRMOverviewProps {
  contacts: ContactRecord[];
}

export function CRMOverview({ contacts }: CRMOverviewProps) {
  const today = startOfToday();
  const contactCount = contacts.length;
  const activeCount = contacts.filter((contact) => contact.stage !== "Waiting")
    .length;
  const overdueTasks = contacts.flatMap((contact) =>
    contact.tasks.filter(
      (task) => !task.completed && isBefore(new Date(task.dueDate), today),
    ),
  ).length;
  const thisWeekTouches = contacts.flatMap((contact) =>
    contact.interactions.filter((interaction) => {
      const diff = Math.abs(
        differenceInCalendarDays(today, new Date(interaction.date)),
      );
      return diff <= 7;
    }),
  ).length;

  const stageCounts = contacts.reduce<Record<string, number>>(
    (acc, contact) => {
      acc[contact.stage] = (acc[contact.stage] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const upcomingFollowUps = contacts.filter((contact) =>
    contact.tasks.some(
      (task) =>
        !task.completed && isAfter(new Date(task.dueDate), today) && differenceInCalendarDays(new Date(task.dueDate), today) <= 7,
    ),
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <OverviewCard
        label="Relationships"
        value={contactCount}
        trendLabel={`${activeCount} active`}
      />
      <OverviewCard
        label="Touches (7d)"
        value={thisWeekTouches}
        trendLabel="Logged interactions"
      />
      <OverviewCard
        label="Upcoming follow-ups"
        value={upcomingFollowUps}
        trendLabel="Within 7 days"
      />
      <OverviewCard
        label="Overdue tasks"
        value={overdueTasks}
        trendLabel="Needs attention"
      />

      <div className="md:col-span-4 rounded-3xl border border-zinc-200 bg-white p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Pipeline Snapshot
        </h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <span
              key={stage}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1 text-xs font-semibold text-indigo-600"
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-indigo-400" />
              {stage}: {count}
            </span>
          ))}
          {contacts.length === 0 ? (
            <span className="text-xs text-zinc-400">
              Add contacts to populate pipeline metrics.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface OverviewCardProps {
  label: string;
  value: number;
  trendLabel: string;
}

function OverviewCard({ label, value, trendLabel }: OverviewCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{trendLabel}</p>
    </div>
  );
}
