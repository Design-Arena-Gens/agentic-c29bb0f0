import { format } from "date-fns";
import { useMemo, useState } from "react";
import type { ContactRecord, ContactTask, Interaction } from "@/types/crm";

interface ContactDetailsProps {
  contact: ContactRecord | null;
  onUpdate: (contact: ContactRecord) => void;
  onDelete: (contactId: string) => void;
  onEdit: (contact: ContactRecord) => void;
}

export function ContactDetails({
  contact,
  onUpdate,
  onDelete,
  onEdit,
}: ContactDetailsProps) {
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    dueDate: "",
  });
  const [interactionDraft, setInteractionDraft] = useState({
    type: "Call",
    date: new Date().toISOString().slice(0, 16),
    summary: "",
    nextSteps: "",
  });

  const sortedTasks = useMemo(() => {
    if (!contact) {
      return [];
    }
    return [...contact.tasks].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }, [contact]);

  const sortedInteractions = useMemo(() => {
    if (!contact) {
      return [];
    }
    return [...contact.interactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [contact]);

  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white/60 p-12 text-center text-sm text-zinc-400">
        Select a contact to view the full profile.
      </div>
    );
  }

  const activeContact = contact;

  function persistTask(task: ContactTask) {
    const next: ContactRecord = {
      ...activeContact,
      tasks: activeContact.tasks.some((t) => t.id === task.id)
        ? activeContact.tasks.map((t) => (t.id === task.id ? task : t))
        : [...activeContact.tasks, task],
    };
    onUpdate(next);
  }

  function persistInteraction(interaction: Interaction) {
    const next: ContactRecord = {
      ...activeContact,
      lastInteraction: interaction.date,
      interactions: activeContact.interactions.some((i) => i.id === interaction.id)
        ? activeContact.interactions.map((i) =>
            i.id === interaction.id ? interaction : i,
          )
        : [...activeContact.interactions, interaction],
    };
    onUpdate(next);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">
              {contact.name}
            </h2>
            <p className="text-sm text-zinc-500">
              {contact.jobTitle} · {contact.company}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
              {contact.stage}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(contact)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(contact.id)}
                className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 text-sm">
          <div className="flex gap-2 text-zinc-600">
            <dt className="w-24 font-medium text-zinc-500">Email</dt>
            <dd>
              <a
                href={`mailto:${contact.email}`}
                className="text-indigo-600 hover:underline"
              >
                {contact.email}
              </a>
            </dd>
          </div>
          <div className="flex gap-2 text-zinc-600">
            <dt className="w-24 font-medium text-zinc-500">Phone</dt>
            <dd>
              <a
                href={`tel:${contact.phone}`}
                className="text-indigo-600 hover:underline"
              >
                {contact.phone}
              </a>
            </dd>
          </div>
          <div className="flex gap-2 text-zinc-600">
            <dt className="w-24 font-medium text-zinc-500">Location</dt>
            <dd>{contact.location}</dd>
          </div>
          <div className="flex gap-2 text-zinc-600">
            <dt className="w-24 font-medium text-zinc-500">Notes</dt>
            <dd className="max-w-xl leading-relaxed text-zinc-700">
              {contact.notes}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Tasks
            </h3>
            <span className="text-xs text-zinc-400">
              {sortedTasks.filter((task) => !task.completed).length} open
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {sortedTasks.map((task) => (
              <li key={task.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 px-3 py-2 transition hover:border-indigo-200">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      persistTask({ ...task, completed: !task.completed })
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 text-sm text-zinc-600">
                    <p
                      className={
                        task.completed
                          ? "font-medium text-zinc-400 line-through"
                          : "font-medium text-zinc-700"
                      }
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Due{" "}
                      {format(new Date(task.dueDate), "MMM d, yyyy 'at' h:mma")}
                    </p>
                  </div>
                </label>
              </li>
            ))}
            {sortedTasks.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400">
                No tasks yet. Add the first follow-up below.
              </li>
            ) : null}
          </ul>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!taskDraft.title || !taskDraft.dueDate) {
                return;
              }
              persistTask({
                id: crypto.randomUUID(),
                title: taskDraft.title,
                dueDate: new Date(taskDraft.dueDate).toISOString(),
                completed: false,
              });
              setTaskDraft({ title: "", dueDate: "" });
            }}
          >
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500">
                New Task
              </label>
              <input
                type="text"
                value={taskDraft.title}
                onChange={(event) =>
                  setTaskDraft({ ...taskDraft, title: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="What needs to happen next?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={taskDraft.dueDate}
                onChange={(event) =>
                  setTaskDraft({ ...taskDraft, dueDate: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={!taskDraft.title || !taskDraft.dueDate}
            >
              Add Task
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Timeline
            </h3>
            <span className="text-xs text-zinc-400">
              {contact.interactions.length} touchpoints
            </span>
          </div>

          <ol className="mt-4 space-y-4">
            {sortedInteractions.map((interaction) => (
              <li
                key={interaction.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-500">
                    {interaction.type}
                  </span>
                  <time className="text-xs text-zinc-400">
                    {format(new Date(interaction.date), "eee, MMM d • h:mma")}
                  </time>
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  {interaction.summary}
                </p>
                {interaction.nextSteps ? (
                  <p className="mt-2 text-xs font-medium text-zinc-500">
                    Next steps:{" "}
                    <span className="font-normal text-zinc-600">
                      {interaction.nextSteps}
                    </span>
                  </p>
                ) : null}
              </li>
            ))}
            {sortedInteractions.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400">
                No interactions logged yet.
              </li>
            ) : null}
          </ol>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!interactionDraft.summary) {
                return;
              }
              persistInteraction({
                id: crypto.randomUUID(),
                type: interactionDraft.type as Interaction["type"],
                date: new Date(interactionDraft.date).toISOString(),
                summary: interactionDraft.summary,
                nextSteps: interactionDraft.nextSteps || undefined,
              });
              setInteractionDraft({
                type: "Call",
                date: new Date().toISOString().slice(0, 16),
                summary: "",
                nextSteps: "",
              });
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">
                  Interaction Type
                </label>
                <select
                  value={interactionDraft.type}
                  onChange={(event) =>
                    setInteractionDraft({
                      ...interactionDraft,
                      type: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Note">Note</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">
                  When
                </label>
                <input
                  type="datetime-local"
                  value={interactionDraft.date}
                  onChange={(event) =>
                    setInteractionDraft({
                      ...interactionDraft,
                      date: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500">
                Summary
              </label>
              <textarea
                value={interactionDraft.summary}
                onChange={(event) =>
                  setInteractionDraft({
                    ...interactionDraft,
                    summary: event.target.value,
                  })
                }
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="Highlight outcomes or key talking points"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500">
                Next Steps (optional)
              </label>
              <textarea
                value={interactionDraft.nextSteps}
                onChange={(event) =>
                  setInteractionDraft({
                    ...interactionDraft,
                    nextSteps: event.target.value,
                  })
                }
                rows={2}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="What should happen next?"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={!interactionDraft.summary}
            >
              Log Interaction
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
