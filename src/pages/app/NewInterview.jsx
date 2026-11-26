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

const INTERVIEW_TYPES = [
  {
    value: "TECHNICAL",
    label: "Technical",
    description:
      "Scenario-based questions on each skill: debugging, trade-offs and real depth.",
    usesSkills: true,
  },
  {
    value: "PROJECT_BASED",
    label: "Project based",
    description:
      "Deep dive into the candidate's real projects: ownership, decisions and results.",
    usesSkills: true,
  },
  {
    value: "BEHAVIORAL",
    label: "Behavioral",
    description:
      "Real past experiences on teamwork, conflict and accountability. No skills quiz.",
    usesSkills: false,
  },
  {
    value: "HR",
    label: "HR",
    description:
      "Motivation, career goals, work style and culture fit. No technical questions.",
    usesSkills: false,
  },
  {
    value: "MIXED",
    label: "Mixed",
    description:
      "Technical, project deep dive and behavioral questions in one interview.",
    usesSkills: true,
  },
];

const EXPERIENCE_LEVELS = [
  {
    value: "ENTRY_LEVEL",
    label: "Entry level",
    description: "Fresher to 1 year. Fundamentals and learning ability.",
  },
  {
    value: "JUNIOR",
    label: "Junior",
    description: "1 to 3 years. Everyday tasks, debugging and code quality.",
  },
  {
    value: "MID_LEVEL",
    label: "Mid level",
    description: "3 to 6 years. Ownership, trade-offs and production issues.",
  },
  {
    value: "SENIOR",
    label: "Senior",
    description: "6+ years. Architecture, scale, leadership and impact.",
  },
];

const MAX_WEIGHT = 50;
const WEIGHT_STEP = 5;

const DEFAULT_CRITERIA = [
  {
    name: "Technical Skills",
    weight: 35,
    description: "Evaluate technical knowledge and required skills.",
  },
  {
    name: "Relevant Projects",
    weight: 25,
    description: "Evaluate project experience and individual contributions.",
  },
  {
    name: "Problem Solving",
    weight: 15,
    description: "Evaluate analytical thinking and problem-solving.",
  },
  {
    name: "Communication",
    weight: 10,
    description: "Evaluate clarity and relevance of responses.",
  },
  {
    name: "Motivation & Role Fit",
    weight: 15,
    description: "Evaluate interest and suitability for the role.",
  },
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

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
            data-testid={`skill-chip-${slug(s)}`}
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
              data-testid={`skill-suggestion-${slug(s)}`}
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

function RadioCards({
  name,
  value,
  onChange,
  options,
  ariaLabel,
  testIdPrefix,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-2.5 sm:grid-cols-2"
    >
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <label key={o.value} className="block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
              data-testid={`${testIdPrefix}-${slug(o.value)}`}
            />
            <div className="h-full rounded-lg border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 peer-checked:border-slate-900 peer-checked:bg-slate-50 peer-checked:ring-1 peer-checked:ring-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600/40">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-slate-900" : "border-slate-300"}`}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-slate-900" />
                  )}
                </span>
                <span className="text-[13px] font-medium text-slate-900">
                  {o.label}
                </span>
              </div>
              <p className="mt-1.5 pl-6 text-xs leading-relaxed text-slate-500">
                {o.description}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function CriteriaWeights({ value, onChange, error }) {
  const total = value.reduce((sum, c) => sum + c.weight, 0);
  const update = (index, weight) =>
    onChange(value.map((c, i) => (i === index ? { ...c, weight } : c)));

  return (
    <div data-testid="criteria-weights">
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {value.map((c, i) => (
          <div
            key={c.name}
            className="space-y-2.5 p-3.5"
            data-testid={`criterion-${slug(c.name)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-slate-900">
                  {c.name}
                </p>
                <p className="text-xs text-slate-500">{c.description}</p>
              </div>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-900">
                {c.weight}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={MAX_WEIGHT}
              step={WEIGHT_STEP}
              value={c.weight}
              onChange={(e) => update(i, Number(e.target.value))}
              className="w-full cursor-pointer accent-black"
              aria-label={`${c.name} weight`}
              aria-valuetext={`${c.weight}%`}
              data-testid={`criterion-${slug(c.name)}-weight-slider`}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className={`text-xs ${error ? "text-rose-600" : "text-slate-500"}`}>
          {error || "Choose a weight for each criterion. They must add up to 100%."}
        </p>
        <span
          className={`shrink-0 rounded-md px-3 py-1 text-sm font-semibold ${total === 100 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
          data-testid="criteria-total"
        >
          Total {total}%
        </span>
      </div>
    </div>
  );
}

function Preview({ form }) {
  const type = INTERVIEW_TYPES.find((t) => t.value === form.interviewType);
  const level = EXPERIENCE_LEVELS.find((l) => l.value === form.experienceLevel);
  const usesSkills = type?.usesSkills ?? true;

  const planItems = usesSkills
    ? form.skills.slice(0, 4).map((s) => ({
        title: s,
        text: `Scenario and follow-up questions to gather evidence on ${s.toLowerCase()} depth.`,
      }))
    : form.criteria
        .filter((c) => c.weight > 0)
        .slice(0, 4)
        .map((c) => ({ title: c.name, text: c.description }));

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
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-200">
              {type?.label}
            </span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-200">
              {level?.label}
            </span>
          </div>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm">
          <p className="flex items-center gap-2 text-slate-300">
            <Mail className="h-3.5 w-3.5 text-slate-500" />
            {form.candidateEmail || "candidate@email.com"}
          </p>
          <p className="flex items-center gap-2 text-slate-300">
            <Clock className="h-3.5 w-3.5 text-slate-500" />~
            {form.durationMinutes} {form.durationMinutes === 1 ? "minute" : "minutes"} · camera & microphone
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
        {planItems.length === 0 && (
          <p className="text-sm text-slate-500">
            {usesSkills
              ? "Add required skills to see the interview plan."
              : "Give at least one criterion a weight to see the interview plan."}
          </p>
        )}
        {planItems.map((item, i) => (
          <div
            key={item.title}
            className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
          >
            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Block {i + 1} · {item.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{item.text}</p>
            </div>
          </div>
        ))}
        {planItems.length > 0 && (
          <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
            <Sparkles className="h-3 w-3 text-blue-600" />
            {usesSkills
              ? "Each skill receives its own 0–100 score in the report."
              : "Scores are weighted by your evaluation criteria."}
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
    interviewType: "MIXED",
    experienceLevel: "MID_LEVEL",
    skills: ["Node.js", "PostgreSQL"],
    criteria: DEFAULT_CRITERIA,
    candidateEmail: orgId ? "" : user.email,
    candidateName: "",
    durationMinutes: 8,
  });
  const [created, setCreated] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const usesSkills =
    INTERVIEW_TYPES.find((t) => t.value === form.interviewType)?.usesSkills ??
    true;

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e?.target ? e.target.value : e,
    }));

  const changeType = (next) => {
    setForm((f) => ({ ...f, interviewType: next }));
    setErrors((e) => ({ ...e, skills: undefined, criteria: undefined }));
  };

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

    if (usesSkills && form.skills.length < 2) {
      err.skills = "Add at least two skills to evaluate.";
    }

    const totalWeight = form.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      err.criteria = `Weights must add up to 100% (currently ${totalWeight}%).`;
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

      const iv = await interviewsService.create(
        {
          ...form,
          skills: usesSkills ? form.skills : [],
          criteria: form.criteria
            .filter((c) => c.weight > 0)
            .map(({ name, weight, description }) => ({
              name,
              weight,
              description,
            })),
          durationMinutes: Math.min(
            8,
            Math.max(1, Number(form.durationMinutes))
          ),
        },
        context
      );
      setCreated(iv?.interview);
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
        description="Define the role, interview style and evaluation criteria. The AI interviewer structures every question around them."
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
            title="Interview type"
            description="Choose how the AI interviewer should run the conversation"
          >
            <RadioCards
              name="interviewType"
              ariaLabel="Interview type"
              value={form.interviewType}
              onChange={changeType}
              options={INTERVIEW_TYPES}
              testIdPrefix="interview-type"
            />
          </Panel>

          <Panel
            title="Experience level"
            description="Sets the difficulty and the kind of questions the AI asks"
          >
            <RadioCards
              name="experienceLevel"
              ariaLabel="Experience level"
              value={form.experienceLevel}
              onChange={set("experienceLevel")}
              options={EXPERIENCE_LEVELS}
              testIdPrefix="experience-level"
            />
          </Panel>

          {usesSkills && (
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
          )}

          <Panel
            title="Evaluation criteria"
            description="Select how much each criterion counts toward the final result"
          >
            <CriteriaWeights
              value={form.criteria}
              onChange={set("criteria")}
              error={errors.criteria}
            />
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

              <Field label="Candidate name (optional)" htmlFor="cname">
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
              ) : isOrg ? (
                "Create & send interview"
              ) : (
                "Create interview"
              )}
            </Button>
          </div>
        </div>

        <Preview form={form} />
      </form>
    </>
  );
}