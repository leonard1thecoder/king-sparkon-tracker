"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Boxes, BriefcaseBusiness, ImagePlus, Loader2, Ticket, Trash2, Upload, WalletCards } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  deactivateAffiliatePoster,
  listAdminAffiliatePosters,
  uploadAffiliatePoster,
  type AffiliatePoster,
  type AffiliatePosterCategory,
} from "@/lib/api/affiliate-posters";
import { normalizeApiError } from "@/lib/api/client";

const categoryOptions: Array<{ value: AffiliatePosterCategory; label: string }> = [
  { value: "TICKETS", label: "Tickets platform" },
  { value: "PRODUCTS", label: "Products platform" },
  { value: "TIPS", label: "Tips" },
  { value: "JOB_OPPORTUNITIES", label: "Job opportunities" },
];

function categoryLabel(category: AffiliatePosterCategory) {
  return categoryOptions.find((item) => item.value === category)?.label ?? category;
}

function CategoryIcon({ category }: { category: AffiliatePosterCategory }) {
  if (category === "TICKETS") return <Ticket className="h-4 w-4" />;
  if (category === "PRODUCTS") return <Boxes className="h-4 w-4" />;
  if (category === "TIPS") return <WalletCards className="h-4 w-4" />;
  return <BriefcaseBusiness className="h-4 w-4" />;
}

const inputClass = "min-h-12 w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]";

export function AdminAffiliatePosterWorkspace() {
  const [posters, setPosters] = useState<AffiliatePoster[]>([]);
  const [category, setCategory] = useState<AffiliatePosterCategory>("TICKETS");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function load() {
    setLoading(true);
    try {
      const rows = await listAdminAffiliatePosters();
      setPosters(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a poster image from your device.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await uploadAffiliatePoster({ category, title, description, file });
      setTitle("");
      setDescription("");
      setFile(null);
      setNotice("Poster uploaded and published to the affiliate campaign library.");
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(poster: AffiliatePoster) {
    setError(null);
    setNotice(null);
    try {
      await deactivateAffiliatePoster(poster.id);
      setNotice(`${poster.title} was removed from the affiliate library.`);
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    }
  }

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Affiliate posters"
        description="Upload approved campaign images from your device for Tickets, Products, Tips and Job Opportunities."
      />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        {error ? <p className="rounded-[1.25rem] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        {notice ? <p className="rounded-[1.25rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--ink)]">{notice}</p> : null}

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Upload campaign poster</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Select a PNG, JPEG, WebP or GIF file. The backend stores the image in managed storage; administrators do not paste image URLs.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-[var(--ink)]">Platform category</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value as AffiliatePosterCategory)} className={inputClass}>
                    {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-[var(--ink)]">Poster title</span>
                  <input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="Example: Sell verified QR tickets" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-[var(--ink)]">Affiliate caption or guidance</span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} min-h-28 py-3`} placeholder="Explain how affiliates should position this poster." />
                </label>
                <label className="grid gap-2 rounded-[1.25rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-4">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><ImagePlus className="h-4 w-4 text-[var(--signal)]" /> Poster image file</span>
                  <input required type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="text-sm font-bold text-[var(--steel)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:font-black file:text-white" />
                  {previewUrl ? <img src={previewUrl} alt="Poster preview" className="mt-2 max-h-[34rem] w-full rounded-[1rem] object-contain shadow-[var(--shadow-soft)]" /> : null}
                </label>
                <Button type="submit" disabled={saving}><Upload className="h-4 w-4" /> {saving ? "Uploading poster..." : "Upload and publish poster"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Published poster library</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading posters</div>
              ) : posters.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {posters.map((poster) => (
                    <article key={poster.id} className={`overflow-hidden rounded-[1.35rem] border bg-white shadow-[var(--shadow-soft)] ${poster.active ? "border-[var(--line)]" : "border-[var(--danger)]/30 opacity-60"}`}>
                      <div className="aspect-[4/5] bg-[var(--ink)]"><img src={poster.imageUrl} alt={poster.title} className="h-full w-full object-cover" /></div>
                      <div className="grid gap-3 p-4">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--gold)]/20 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--ink)]"><CategoryIcon category={poster.category} /> {categoryLabel(poster.category)}</span>
                        <div><h3 className="font-black text-[var(--ink)]">{poster.title}</h3><p className="mt-1 text-xs leading-5 text-[var(--steel)]">{poster.description || "No caption supplied."}</p></div>
                        {poster.active ? <Button type="button" variant="quiet" onClick={() => void deactivate(poster)}><Trash2 className="h-4 w-4" /> Remove from library</Button> : <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--danger)]">Inactive</span>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-10 text-center text-sm font-bold text-[var(--steel)]">No affiliate posters have been uploaded.</div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
