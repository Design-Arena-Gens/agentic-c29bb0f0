import { useState } from "react";
import type { ContactRecord, Stage } from "@/types/crm";

interface ContactFormProps {
  contact?: ContactRecord | null;
  onSubmit: (contact: ContactRecord) => void;
  onCancel: () => void;
}

const createEmptyForm = () => ({
  name: "",
  company: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  stage: "Lead" as Stage,
  tags: "",
  notes: "",
});

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [formState, setFormState] = useState(() =>
    contact ? mapContactToForm(contact) : createEmptyForm(),
  );

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const tagsSanitized = formState.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        const base: ContactRecord = contact
          ? {
              ...contact,
              name: formState.name,
              company: formState.company,
              jobTitle: formState.jobTitle,
              email: formState.email,
              phone: formState.phone,
              location: formState.location,
              stage: formState.stage,
              notes: formState.notes,
              tags: tagsSanitized,
            }
          : {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              lastInteraction: new Date().toISOString(),
              interactions: [],
              tasks: [],
              name: formState.name,
              company: formState.company,
              jobTitle: formState.jobTitle,
              email: formState.email,
              phone: formState.phone,
              location: formState.location,
              stage: formState.stage,
              notes: formState.notes,
              tags: tagsSanitized,
            };

        onSubmit(base);
        setFormState(createEmptyForm());
      }}
    >
      <FormField
        label="Name"
        value={formState.name}
        onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
        required
      />
      <FormField
        label="Company"
        value={formState.company}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, company: value }))
        }
      />
      <FormField
        label="Role"
        value={formState.jobTitle}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, jobTitle: value }))
        }
      />
      <FormField
        label="Email"
        type="email"
        value={formState.email}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, email: value }))
        }
      />
      <FormField
        label="Phone"
        value={formState.phone}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, phone: value }))
        }
      />
      <FormField
        label="Location"
        value={formState.location}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, location: value }))
        }
      />
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Stage
        </label>
        <select
          value={formState.stage}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              stage: event.target.value as Stage,
            }))
          }
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        >
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Waiting">Waiting</option>
          <option value="Customer">Customer</option>
        </select>
      </div>
      <FormField
        label="Tags"
        value={formState.tags}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, tags: value }))
        }
        helper="Comma separated keywords help with segmentation"
      />
      <div className="md:col-span-2">
        <FormField
          label="Notes"
          value={formState.notes}
          onChange={(value) =>
            setFormState((prev) => ({ ...prev, notes: value }))
          }
          multiline
        />
      </div>

      <div className="md:col-span-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-500 transition hover:border-zinc-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={!formState.name}
        >
          {contact ? "Save Changes" : "Create Contact"}
        </button>
      </div>
    </form>
  );
}

function mapContactToForm(contact: ContactRecord) {
  return {
    name: contact.name,
    company: contact.company,
    jobTitle: contact.jobTitle,
    email: contact.email,
    phone: contact.phone,
    location: contact.location,
    stage: contact.stage,
    tags: contact.tags.join(", "),
    notes: contact.notes,
  };
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  helper?: string;
  multiline?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  helper,
  multiline = false,
}: FormFieldProps) {
  const inputClasses =
    "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className={inputClasses}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClasses}
          required={required}
        />
      )}
      {helper ? (
        <p className="text-xs text-zinc-400">{helper}</p>
      ) : null}
    </div>
  );
}
