import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  X,
  Bot,
  Copy,
  Loader2,
  Sparkles,
  Mail,
  Building2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel } from "@/components/common/Layout";
import { Restricted } from "@/components/common/Restricted";
import { SuccessState } from "@/components/common/States";
import { interviewsService } from "@/services";
import { useSession } from "@/context/SessionContext";

const SUGGESTED = [
  "Node.js",
  "PostgreSQL",
  "System Design",
  "Docker",
  "Redis",
  "React",
  "TypeScript",
  "AWS",
  "Kubernetes",
  "Communication",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SkillsInput({ value, onChange, error }) {
  const [draft, setDraft] = useState("");
  const add = (s) => {
    const v = s.trim().replace(/,$/, "");
    if (v && !value.includes(v) && value.length < 10) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <div
        className={`flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-600/20 ${error ? "border-rose-300" : "border-input"}`}
        data-testid="skills-input-wrapper"
      >
        {value.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-md bg-slate-900 py-1 pl-2 pr-1 text-xs font-medium text-white"
            data-testid={`skill-chip-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          >
            {s}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== s))}
              className="rounded p-0.5 hover:bg-white/20"
              aria-label={`Remove ${s}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
            if (e.key === "Backspace" && !draft && value.length)
              onChange(value.slice(0, -1));
          }}
          placeholder={
            value.length ? "Add another…" : "Type a skill and press Enter"
          }
          className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
          data-testid="skills-input"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTED.filter((s) => !value.includes(s))
          .slice(0, 7)
          .map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => add(s)}
              className="rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:border-slate-400 hover:bg-white"
              data-testid={`skill-suggestion-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );
}

const Field = ({ label, error, hint, children, htmlFor }) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-[13px] font-medium text-slate-700">
      {label}
    </Label>
    {children}
    {error ? (
      <p className="text-xs text-rose-600">{error}</p>
    ) : (
      hint && <p className="text-xs text-slate-500">{hint}</p>
    )}
  </div>
);

function Preview({ form }) {
  const questions = form.skills.slice(0, 4);
  return (
    <div className="sticky top-24 space-y-4" data-testid="interview-preview">
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F17] text-white">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
            Candidate invitation preview
          </p>
          <p className="mt-2 font-display text-lg font-semibold">
            {form.title || "Untitled interview"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
            <Building2 className="h-3.5 w-3.5" />
            {form.company || "Company"} · {form.role || "Role"}
          </p>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm">
          <p className="flex items-center gap-2 text-slate-300">
            <Mail className="h-3.5 w-3.5 text-slate-500" />
            {form.candidateEmail || "candidate@email.com"}
          </p>
          <p className="flex items-center gap-2 text-slate-300">
            <Clock className="h-3.5 w-3.5 text-slate-500" />~
            {Math.max(20, form.skills.length * 7)} minutes · camera & microphone
          </p>
          <p className="line-clamp-3 text-slate-400">
            {form.description ||
              "Add a description so the AI interviewer understands the role's context."}
          </p>
        </div>
      </div>
      <Panel
        title="What the AI interviewer will cover"
        bodyClassName="space-y-2.5"
      >
        {questions.length === 0 && (
          <p className="text-sm text-slate-500">
            Add required skills to see the interview plan.
          </p>
        )}
        {questions.map((s, i) => (
          <div
            key={s}
            className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
          >
            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Block {i + 1} · {s}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Scenario and follow-up questions to gather evidence on{" "}
                {s.toLowerCase()} depth.
              </p>
            </div>
          </div>
        ))}
        {form.skills.length > 0 && (
          <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
            <Sparkles className="h-3 w-3 text-blue-600" />
            Each skill receives its own 0–100 score in the report.
          </p>
        )}
      </Panel>
    </div>
  );
}


export default function NewInterviewPage() {
  const { context, user, orgId, orgName } = useSession();
  const navigate = useNavigate();
  const isOrg = context === "organization";

  const [form, setForm] = useState({
    title: "",
    role: "",
    company: orgName || "",
    description: "",
    skills: ["Node.js", "PostgreSQL"],
    candidateEmail: orgId ? "" : user.email,
    candidateName: "",
    durationMinutes: 8,
  });
   const [created, setcreated] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e?.target ? e.target.value : e,
    }));

  const submit = async (e) => {
    e.preventDefault();

    const err = {};

    if (!form.title.trim()) {
      err.title = "Give the interview a title.";
    }

    if (!form.role.trim()) {
      err.role = "Which role is this interview for?";
    }

    if (!form.company.trim()) {
      err.company = "Company name is required.";
    }

    if (form.skills.length < 2) {
      err.skills = "Add at least two skills to evaluate.";
    }

    if (!EMAIL.test(form.candidateEmail)) {
      err.candidateEmail = "Enter a valid email address.";
    }

    if (
      !Number.isInteger(form.durationMinutes) ||
      form.durationMinutes < 1 ||
      form.durationMinutes > 8
    ) {
      err.durationMinutes = "Duration must be between 1 and 8 minutes.";
    }

    setErrors(err);

    if (Object.keys(err).length) return;

    try {
      setStatus("loading");

  const  iv =  await interviewsService.create(
        {
          ...form,
          durationMinutes: Math.min(
            8,
            Math.max(1, Number(form.durationMinutes))
          ),
        },
        context
      );
       setcreated(iv?.interview);
      setStatus("success");

      toast.success("Interview created", {
        description: `Invitation sent to ${form.candidateEmail}`,
      });
    } catch (error) {
      setStatus("idle");

      toast.error(
        error?.message || "Failed to create interview. Please try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white"
        data-testid="new-interview-success"
      >
        <SuccessState
          title="Interview created"
          description={`${created?.title} is ready. We've emailed the interview link to ${
            form.candidateEmail
          }.`}
        >
          <Button
            variant="outline"
            onClick={() => {
              const link = `https://ai-intervia.vercel.app/interview/${created?.slug}`;

              navigator.clipboard?.writeText(link);
              toast.success("Link copied");
            }}
            data-testid="copy-new-interview-link"
          >
            <Copy className="mr-1.5 h-4 w-4" />
            Copy link
          </Button>

          <Button
            onClick={() => navigate(`/app/interviews/${created?.slug}`)}
            data-testid="view-new-interview-button"
          >


            View interview
          </Button>
        </SuccessState>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={orgName || "Personal"}
        title="New interview"
        description="Define the role and required skills. The AI interviewer structures every question around them."
      />

      <form
        onSubmit={submit}
        className="grid gap-6 xl:grid-cols-[1fr_380px]"
        noValidate
        data-testid="new-interview-form"
      >
        <div className="space-y-6">
          <Panel
            title="Role"
            description="What the candidate is interviewing for"
            bodyClassName="grid gap-5 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <Field
                label="Interview title"
                error={errors.title}
                htmlFor="title"
              >
                <Input
                  id="title"
                  value={form.title}
                  onChange={set("title")}
                  placeholder="Senior Backend Engineer — Platform"
                  data-testid="new-interview-title-input"
                />
              </Field>
            </div>

            <Field label="Role" error={errors.role} htmlFor="role">
              <Input
                id="role"
                value={form.role}
                onChange={set("role")}
                placeholder="Senior Backend Engineer"
                data-testid="new-interview-role-input"
              />
            </Field>

            <Field
              label="Company name"
              error={errors.company}
              htmlFor="company"
            >
              <Input
                id="company"
                value={form.company}
                onChange={set("company")}
                data-testid="new-interview-company-input"
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Description"
                hint="Context helps the AI ask realistic, role-specific questions."
                htmlFor="desc"
              >
                <Textarea
                  id="desc"
                  rows={4}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Own core services for our multi-tenant platform. Focus on API design, data modelling and reliability."
                  data-testid="new-interview-description-input"
                />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Required skills"
            description="Each skill is evaluated and scored individually"
          >
            <Field label="Skills" error={errors.skills}>
              <SkillsInput
                value={form.skills}
                onChange={set("skills")}
                error={errors.skills}
              />
            </Field>
          </Panel>

          <Panel
            title="Interview duration"
            description="Choose how long the AI interview should last."
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="duration"
                  className="text-sm font-medium text-slate-700"
                >
                  Duration
                </label>

                <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                  {form.durationMinutes}{" "}
                  {form.durationMinutes === 1 ? "minute" : "minutes"}
                </span>
              </div>

              <input
                id="duration"
                type="range"
                min={1}
                max={8}
                step={1}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    durationMinutes: Number(e.target.value),
                  }))
                }
                className="w-full cursor-pointer accent-black"
                aria-label="Interview duration in minutes"
                data-testid="interview-duration-slider"
              />


              {errors.durationMinutes && (
                <p className="text-sm text-red-600">
                  {errors.durationMinutes}
                </p>
              )}

              <p className="text-sm text-slate-500">
                Select between 1 and 8 minutes. The interview cannot exceed
                8 minutes.
              </p>
            </div>
          </Panel>

          {isOrg && (
            <Panel
              title="Candidate"
              description="We'll email a private interview link"
              bodyClassName="grid gap-5 md:grid-cols-2"
            >
              <Field
                label="Candidate email"
                error={errors.candidateEmail}
                htmlFor="email"
              >
                <Input
                  id="email"
                  type="email"
                  value={form.candidateEmail}
                  onChange={set("candidateEmail")}
                  placeholder="name@email.com"
                  data-testid="new-interview-candidate-email-input"
                />
              </Field>

              <Field
                label="Candidate name (optional)"
                htmlFor="cname"
              >
                <Input
                  id="cname"
                  value={form.candidateName}
                  onChange={set("candidateName")}
                  placeholder="Jordan Lee"
                  data-testid="new-interview-candidate-name-input"
                />
              </Field>
            </Panel>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" asChild>
              <Link to="/app/interviews">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={status === "loading"}
              data-testid="new-interview-submit-button"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                `Create ${isOrg ? "& send" : ""} interview`
              )}
            </Button>
          </div>
        </div>

        <Preview form={form} />
      </form>
    </>
  );
}

