"use client";

import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { SimulationFormValues } from "@/types/simulation.types";
import api from "@/lib/axios";
import NeoRichTextEditor from "@/components/ui/NeoRichTextEditor";
import {Upload, X} from "lucide-react";

// Suggested providers shown in the dropdown to guide the admin.
// The admin can also type a custom provider name.
const KNOWN_PROVIDERS = [
    "PhET Interactive Simulations",
    "GeoGebra",
    "HHMI BioInteractive",
    "Concord Consortium",
    "Falstad",
    "ChemCollective",
    "Learn.Genetics",
    "NASA",
    "NOAA",
    "Other",
];

const SUBJECT_OPTIONS = [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "Earth Science",
    "Computer Science",
    "Astronomy",
    "Environmental Science",
];

const GRADE_LEVELS = [
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "University",
    "All Levels",
];

const EMPTY_FORM: SimulationFormValues = {
    title: "",
    description: "",
    subject: "",
    gradeLevel: "",
    provider: "",
    simulationUrl: "",
    thumbnailUrl: "",
    isPublished: false,
};

interface SimulationFormProps {
    // If provided, the form is in edit mode and will send a PUT request
    initialValues?: Partial<SimulationFormValues>;
    simulationId?: string;
}

interface FieldError {
    [key: string]: string;
}

export function SimulationForm({ initialValues, simulationId }: SimulationFormProps) {
    const router = useRouter();
    const isEditMode = !!simulationId;

    const [values, setValues] = useState<SimulationFormValues>({
        ...EMPTY_FORM,
        ...initialValues,
    });

    const [errors, setErrors] = useState<FieldError>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [thumbnailOption, setThumbnailOption] = useState<"upload" | "url">("upload");
    const [thumbPreview, setThumbPreview] = useState<string>("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    function set<K extends keyof SimulationFormValues>(key: K, value: SimulationFormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
        // Clear error for field when user starts editing it
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    }

    function validate(): boolean {
        const next: FieldError = {};

        if (!values.title.trim()) next.title = "Title is required.";
        if (!values.subject) next.subject = "Subject is required.";
        if (!values.gradeLevel) next.gradeLevel = "Grade level is required.";
        if (!values.provider.trim()) next.provider = "Provider name is required.";

        if (!values.simulationUrl.trim()) {
            next.simulationUrl = "Simulation URL is required.";
        } else {
            try {
                new URL(values.simulationUrl);
            } catch {
                next.simulationUrl = "Enter a valid URL (e.g. https://phet.colorado.edu/...).";
            }
        }

        if (values.thumbnailUrl && values.thumbnailUrl.trim()) {
            try {
                new URL(values.thumbnailUrl);
            } catch {
                next.thumbnailUrl = "Enter a valid thumbnail URL.";
            }
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);
        setServerError("");

        const endpoint = isEditMode ? `/api/simulations/${simulationId}` : "/api/simulations";

        try {
            const payload = {
                ...values,
                thumbnailUrl: values.thumbnailUrl.trim() || null
            };

            isEditMode ? await api.put(endpoint, payload) : await api.post(endpoint, payload);

            router.push("/admin/simulations");
            router.refresh();
        } catch {
            setServerError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setThumbnailFile(file);
        setThumbPreview(URL.createObjectURL(file));
    }

    useEffect(() => {
        if (thumbnailFile) uploadThumbnail();
    }, [thumbnailFile]);

    const uploadThumbnail = async () => {
        setUploading(true)
        const formData = new FormData();
        // @ts-ignore
        formData.append("thumbnailUrl", thumbnailFile);
        const { data } = await api.post(
            "/api/upload/simulation-thumbnail",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        )
        if (data) setValues((prev) => ({ ...prev, thumbnailUrl: data.data.url }))
        setUploading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {serverError}
                </div>
            )}

            {/* Title */}
            <Field label="Title" error={errors.title} required>
                <input
                    type="text"
                    value={values.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Wave Interference Simulation"
                    className={inputClass(!!errors.title)}
                />
            </Field>

            {/* Description */}
            <Field label="Description" error={errors.description}>
                <NeoRichTextEditor
                    initialValue={values.description}
                    onBlur={(html) => set("description", html)}
                />
            </Field>

            {/* Subject and Grade Level - side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Subject" error={errors.subject} required>
                    <select
                        value={values.subject}
                        onChange={(e) => set("subject", e.target.value)}
                        className={inputClass(!!errors.subject)}
                    >
                        <option value="">Select subject</option>
                        {SUBJECT_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Grade Level" error={errors.gradeLevel} required>
                    <select
                        value={values.gradeLevel}
                        onChange={(e) => set("gradeLevel", e.target.value)}
                        className={inputClass(!!errors.gradeLevel)}
                    >
                        <option value="">Select grade level</option>
                        {GRADE_LEVELS.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* Provider */}
            <Field
                label="Provider"
                error={errors.provider}
                required
                hint="The platform or organization that created the simulation."
            >
                <input
                    type="text"
                    value={values.provider}
                    onChange={(e) => set("provider", e.target.value)}
                    placeholder="e.g. PhET Interactive Simulations"
                    list="provider-suggestions"
                    className={inputClass(!!errors.provider)}
                />
                <datalist id="provider-suggestions">
                    {KNOWN_PROVIDERS.map((p) => (
                        <option key={p} value={p}/>
                    ))}
                </datalist>
            </Field>

            {/* Simulation URL */}
            <Field
                label="Simulation URL"
                error={errors.simulationUrl}
                required
                hint="The direct link to the simulation page. Must be an HTTPS URL."
            >
                <input
                    type="url"
                    value={values.simulationUrl}
                    onChange={(e) => set("simulationUrl", e.target.value)}
                    placeholder="https://phet.colorado.edu/sims/html/..."
                    className={inputClass(!!errors.simulationUrl)}
                />
            </Field>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={thumbnailOption === "url"}
                    onClick={() => thumbnailOption === "url" ? setThumbnailOption("upload") : setThumbnailOption("url")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        thumbnailOption === "url" ? "bg-blue-600" : "bg-gray-300"
                    }`}
                >
                  <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                          thumbnailOption === "url" ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Submit thumbnail URL instead of Upload</span>
                </div>
            </div>

            {/* Thumbnail URL */}
            <Field
                label={thumbnailOption === "upload" ? "Thumbnail Upload" : "Thumbnail URL"}
                error={errors.thumbnailUrl}
                hint="Optional preview image. Use a Cloudinary URL or leave blank."
            >
                {thumbnailOption === "upload" && (
                    <>
                        {thumbPreview ? (
                            <div className="relative inline-block">
                                <img
                                    src={thumbPreview}
                                    alt="Logo Preview"
                                    className="w-1/2 mx-auto object-contain border border-slate-200 rounded-lg p-2 bg-slate-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setThumbPreview("");
                                        setThumbnailFile(null);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-3 h-3"/>
                                </button>
                            </div>
                        ) : (
                            <label
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                                <Upload className="w-6 h-6 text-slate-400 mb-2"/>
                                <span className="text-sm text-slate-500">Click to upload thumbnail</span>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.svg,.webp"
                                    onChange={handleThumbnailUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </>
                )}

                {thumbnailOption === "url" && (
                    <input
                        type="url"
                        value={values.thumbnailUrl}
                        onChange={(e) => set("thumbnailUrl", e.target.value)}
                        placeholder="https://res.cloudinary.com/..."
                        className={inputClass(!!errors.thumbnailUrl)}
                    />
                )}

                {uploading && <span className="text-gray-600 text-sm">Uploading thumbnail, please wait...</span>}
            </Field>

            {/* Published toggle */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={values.isPublished}
                    onClick={() => set("isPublished", !values.isPublished)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        values.isPublished ? "bg-blue-600" : "bg-gray-300"
                    }`}
                >
          <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                  values.isPublished ? "translate-x-6" : "translate-x-1"
              }`}
          />
                </button>
                <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {values.isPublished ? "Published" : "Draft"}
          </span>
                    <span className="text-xs text-gray-400">
            {values.isPublished
                ? "Visible to students and the public site."
                : "Only visible to admins."}
          </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                    {submitting
                        ? isEditMode
                            ? "Saving..."
                            : "Creating..."
                        : isEditMode
                            ? "Save Changes"
                            : "Create Simulation"}
                </button>

                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={submitting || uploading}
                    className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// Field wrapper handles label, error message and hint text consistently
function Field({
                   label,
                   error,
                   hint,
                   required,
                   children,
               }: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function inputClass(hasError: boolean): string {
    return [
        "w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
        hasError
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
    ].join(" ");
}