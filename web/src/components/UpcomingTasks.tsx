import { formatDistanceToNow } from "date-fns";
import type { ContactRecord } from "@/types/crm";

interface UpcomingTasksProps {
  contacts: ContactRecord[];
  onToggleTask: (contactId: string, taskId: string) => void;
}

export function UpcomingTasks({
  contacts,
  onToggleTask,
}: UpcomingTasksProps) {
  const tasks = contacts
    .flatMap((contact) =>
      contact.tasks
        .filter((task) => !task.completed)
        .map((task) => ({
          contactId: contact.id,
          contactName: contact.name,
          stage: contact.stage,
          ...task,
        })),
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Upcoming Tasks
        </h3>
        <span className="text-xs text-zinc-400">{tasks.length} soon</span>
      </div>
      <ul className="mt-4 space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700">{task.title}</p>
              <button
                onClick={() => onToggleTask(task.contactId, task.id)}
                className="rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                Mark done
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
              <span>{task.contactName}</span>
              <span>
                due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-600">
              {task.stage}
            </span>
          </li>
        ))}
        {tasks.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400">
            You are all caught up. Add new follow-ups to keep momentum.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
