import type { ContactRecord } from "@/types/crm";
import { formatRelative, isValid, parseISO } from "date-fns";

interface ContactListProps {
  contacts: ContactRecord[];
  selectedContactId: string | null;
  onSelect: (contactId: string) => void;
}

export function ContactList({
  contacts,
  selectedContactId,
  onSelect,
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white/50 p-8 text-center text-sm text-zinc-500">
        No contacts match your filters yet. Add a new contact to get started.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {contacts.map((contact) => {
        const dueTask = contact.tasks
          .filter((task) => !task.completed)
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
          )[0];

        const lastInteractionLabel = formatLastInteraction(
          contact.lastInteraction,
        );

        return (
          <li key={contact.id}>
            <button
              onClick={() => onSelect(contact.id)}
              className={`group w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                selectedContactId === contact.id
                  ? "border-indigo-300 bg-indigo-50 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600">
                    {contact.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {contact.jobTitle} · {contact.company}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {contact.stage}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {contact.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
                {contact.tags.length > 3 ? (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                    +{contact.tags.length - 3} more
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Last touch {lastInteractionLabel}</span>
                {dueTask ? (
                  <span className="flex items-center gap-1 text-indigo-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
                    {formatDueDate(dueTask.dueDate)}
                  </span>
                ) : (
                  <span className="italic text-zinc-400">No open tasks</span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function formatLastInteraction(isoDate: string) {
  const parsed = parseISO(isoDate);
  if (!isValid(parsed)) {
    return "unknown";
  }
  return formatRelative(parsed, new Date());
}

function formatDueDate(isoDate: string) {
  const parsed = parseISO(isoDate);
  if (!isValid(parsed)) {
    return "No date";
  }

  const relative = formatRelative(parsed, new Date());
  return `Task due ${relative}`;
}
