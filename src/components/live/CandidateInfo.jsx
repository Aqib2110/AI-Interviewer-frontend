
import { interviewsService } from "@/services";
import { useState } from "react";

const initialForm = {
  name: "",
  location: "",
  experience: "",
  phone: "",
  email: "",
  currRole: "",
};

export function CandidateInfoForm({ isDone }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.experience.trim()) {
      nextErrors.experience = "Experience is required";
    }

    if (!form.currRole.trim()) {
      nextErrors.currRole = "Current role is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || !validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
        experience: form.experience.trim(),
        phone: form.phone.trim(),
        currRole: form.currRole.trim(),
      };

      await interviewsService.candidateInfo(payload);

      isDone(true);
    } catch (error) {
      console.error("Failed to save candidate information:", error);

      setApiError(
        error?.message || "Unable to save your information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full name",
      placeholder: "e.g. Muhammad Aqib",
      required: true,
    },
    {
      name: "email",
      label: "Email address",
      placeholder: "you@example.com",
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone number",
      placeholder: "e.g. +92 300 1234567",
      type: "tel",
    },
    {
      name: "location",
      label: "Location",
      placeholder: "e.g. Abbottabad, Pakistan",
    },
    {
      name: "currRole",
      label: "Current role",
      placeholder: "e.g. Frontend Developer",
      required: true,
    },
    {
      name: "experience",
      label: "Experience",
      placeholder: "e.g. 2 years of React development",
      required: true,
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl space-y-5 rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Candidate information
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your details before starting the interview.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={
              field.name === "experience" ? "sm:col-span-2" : ""
            }
          >
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {field.label}
              {field.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>

            <input
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              disabled={loading}
              aria-invalid={Boolean(errors[field.name])}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                errors[field.name]
                  ? "border-red-500"
                  : "border-slate-300"
              }`}
            />

            {errors[field.name] && (
              <p className="mt-1 text-xs text-red-600">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      {apiError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving information..." : "Continue to interview"}
      </button>
    </form>
  );
}
