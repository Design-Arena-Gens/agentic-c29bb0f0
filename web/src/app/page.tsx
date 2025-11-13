"use client";

import { useEffect, useMemo, useState } from "react";
import { CRMOverview } from "@/components/CRMOverview";
import { ContactDetails } from "@/components/ContactDetails";
import { ContactForm } from "@/components/ContactForm";
import { ContactList } from "@/components/ContactList";
import { UpcomingTasks } from "@/components/UpcomingTasks";
import { SAMPLE_CONTACTS } from "@/data/sampleData";
import { loadState, saveState } from "@/lib/storage";
import type { ContactRecord, CRMState } from "@/types/crm";

export default function Home() {
  const [contacts, setContacts] = useState<ContactRecord[]>(() => {
    const stored = loadState();
    if (stored?.contacts?.length) {
      return stored.contacts;
    }
    return SAMPLE_CONTACTS;
  });
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    () => {
      const stored = loadState();
      if (stored?.contacts?.length) {
        return stored.contacts[0].id;
      }
      return SAMPLE_CONTACTS[0]?.id ?? null;
    },
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(
    null,
  );

  useEffect(() => {
    const payload: CRMState = { contacts };
    saveState(payload);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        const matchesStage =
          stageFilter === "All" ? true : contact.stage === stageFilter;
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          query.length === 0
            ? true
            : [
                contact.name,
                contact.company,
                contact.jobTitle,
                contact.email,
                contact.tags.join(" "),
              ]
                .join(" ")
                .toLowerCase()
                .includes(query);
        return matchesStage && matchesSearch;
      })
      .sort((a, b) => {
        const aTime = new Date(a.lastInteraction).getTime();
        const bTime = new Date(b.lastInteraction).getTime();
        return bTime - aTime;
      });
  }, [contacts, searchTerm, stageFilter]);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  function handleSave(contact: ContactRecord) {
    setContacts((prev) => {
      const exists = prev.some((c) => c.id === contact.id);
      if (exists) {
        return prev.map((c) => (c.id === contact.id ? contact : c));
      }
      return [contact, ...prev];
    });
    setSelectedContactId(contact.id);
    setIsFormOpen(false);
    setEditingContact(null);
  }

  function handleDelete(contactId: string) {
    setContacts((prev) => {
      const next = prev.filter((contact) => contact.id !== contactId);
      if (selectedContactId === contactId) {
        setSelectedContactId(next[0]?.id ?? null);
      }
      return next;
    });
  }

  function handleToggleTask(contactId: string, taskId: string) {
    setContacts((prev) =>
      prev.map((contact) => {
        if (contact.id !== contactId) {
          return contact;
        }
        return {
          ...contact,
          tasks: contact.tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task,
          ),
        };
      }),
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-indigo-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-16 pt-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
              Personal CRM
            </p>
            <h1 className="mt-1 text-4xl font-semibold text-zinc-900">
              High-touch relationship hub
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Track follow-ups, log interactions, and build a rhythm for your
              most important relationships.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs text-zinc-400 sm:block">
              {contacts.length} relationships tracked
            </div>
            <button
              onClick={() => {
                setEditingContact(null);
                setIsFormOpen(true);
              }}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              + New contact
            </button>
          </div>
        </header>

        <CRMOverview contacts={contacts} />

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Relationships
              </h2>
              <span className="text-xs text-zinc-400">
                {filteredContacts.length} match
              </span>
            </div>
            <div className="space-y-3">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, company, tag..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
              <div className="flex flex-wrap gap-2">
                {["All", "Lead", "Active", "Waiting", "Customer"].map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      stageFilter === stage
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-indigo-200 hover:text-indigo-600"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <ContactList
              contacts={filteredContacts}
              selectedContactId={selectedContactId}
              onSelect={(id) => {
                setSelectedContactId(id);
                setIsFormOpen(false);
              }}
            />
          </aside>

          <main className="rounded-3xl border border-zinc-200 bg-white p-6">
            {isFormOpen ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {editingContact ? "Edit Contact" : "Create Contact"}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Capture context so you never lose momentum.
                  </p>
                </div>
                <ContactForm
                  key={editingContact?.id ?? "new"}
                  contact={editingContact}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingContact(null);
                  }}
                  onSubmit={(contact) => {
                    handleSave(contact);
                  }}
                />
              </div>
            ) : (
              <ContactDetails
                contact={selectedContact}
                onUpdate={handleSave}
                onDelete={(id) => {
                  handleDelete(id);
                }}
                onEdit={(contact) => {
                  setEditingContact(contact);
                  setIsFormOpen(true);
                }}
              />
            )}
          </main>

          <aside className="space-y-4">
            <UpcomingTasks contacts={contacts} onToggleTask={handleToggleTask} />
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Focus Areas
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-zinc-600">
                <li className="rounded-2xl bg-zinc-50 p-3">
                  Create a weekly ritual to log key conversations and schedule
                  next steps.
                </li>
                <li className="rounded-2xl bg-zinc-50 p-3">
                  Tag contacts for quick segmentation before outreach sprints.
                </li>
                <li className="rounded-2xl bg-zinc-50 p-3">
                  Capture personal details in notes to personalize follow-ups.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
