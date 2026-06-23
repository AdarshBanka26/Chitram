import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Type, Loader2, Tag, Wand2 } from 'lucide-react';
import { CATEGORIES } from '../components/CategoryFilter.jsx';
import { workApi, aiApi, errMsg } from '../api/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';

const CATS = CATEGORIES.filter((c) => c !== 'all');

const LICENSE_OPTIONS = [
  { value: 'free',               label: 'Free to use',        hint: 'Anyone may use this for free' },
  { value: 'commercial',         label: 'Commercial use',     hint: 'Available for commercial licensing' },
  { value: 'all-rights-reserved', label: 'All rights reserved', hint: 'No reuse without permission' },
];

export default function Upload() {
  const toast = useToast();
  const navigate = useNavigate();

  const [type, setType] = useState('image');
  const [form, setForm] = useState({
    title: '', description: '', category: 'art', tags: '', textContent: '', license: 'free',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [polishing, setPolishing] = useState(false);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Auto-suggest tags from title + description + category.
  const quickTags = async () => {
    if (!form.title.trim()) return toast.error('Enter a title first');
    setTagging(true);
    try {
      const { tags: suggested } = await aiApi.suggestTags({
        title: form.title,
        description: form.description,
        category: form.category,
      });
      const existing = form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      const merged = [...new Set([...existing, ...suggested])];
      set('tags', merged.join(', '));
      toast.success(`${suggested.length} tags suggested`);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setTagging(false);
    }
  };

  // Polish the description into a gallery-quality blurb.
  const polishDesc = async () => {
    if (!form.description.trim()) return toast.error('Write a rough description first');
    setPolishing(true);
    try {
      const { description: polished } = await aiApi.polish({
        description: form.description,
        title: form.title,
        category: form.category,
      });
      set('description', polished);
      toast.success('Description polished');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setPolishing(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (type === 'image' && !file) return toast.error('Please choose an image');
    if (type === 'writing' && !form.textContent.trim()) return toast.error('Please add your writing');

    setBusy(true);
    try {
      let work;
      if (type === 'image') {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('type', 'image');
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('category', form.category);
        fd.append('tags', form.tags);
        fd.append('license', form.license);
        ({ work } = await workApi.create(fd, true));
      } else {
        ({ work } = await workApi.create({
          type: 'writing',
          title: form.title,
          description: form.description,
          category: form.category,
          textContent: form.textContent,
          license: form.license,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }));
      }
      toast.success('Published! Your work is now live.');
      navigate(`/works/${work._id}`);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x max-w-3xl py-12">
      <div className="mb-4 h-[2px] w-10 bg-gradient-to-r from-saffron to-gold" />
      <p className="label">Share Your Work</p>
      <div className="flex items-baseline gap-3">
        <h1 className="mt-2 font-display text-4xl font-black text-ink">Upload</h1>
        <span className="font-brand text-lg text-saffron/60">सृष्टि</span>
      </div>

      {/* Type toggle */}
      <div className="mt-6 inline-flex rounded-full border border-ink/15 p-1">
        {[
          { v: 'image', label: 'Image', icon: ImagePlus },
          { v: 'writing', label: 'Writing', icon: Type },
        ].map(({ v, label, icon: Icon }) => (
          <button
            key={v}
            onClick={() => setType(v)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider ${
              type === v ? 'bg-ink text-white' : 'text-ink/60'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        {type === 'image' ? (
          <label className="flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border-2 border-dashed border-ink/20 bg-cream/50 transition hover:border-saffron">
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink/50">
                <ImagePlus className="h-8 w-8" />
                <span className="font-mono text-xs uppercase tracking-wider">Click to choose an image (max 10MB)</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
        ) : (
          <div>
            <label className="label">Your writing</label>
            <textarea
              className="input mt-2 min-h-[220px]"
              value={form.textContent}
              onChange={(e) => set('textContent', e.target.value)}
              placeholder="Pour the fleeting wonder onto the page…"
            />
          </div>
        )}

        <div>
          <label className="label">Title</label>
          <input
            className="input mt-2"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            placeholder={type === 'image' ? 'Give your image a title…' : 'Title'}
          />
        </div>

        {/* Description + Polish button */}
        <div>
          <label className="label">Description</label>
          <textarea
            className="input mt-2"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Write a rough description — then hit Polish to refine it…"
          />
          {form.description.trim().length >= 15 && (
            <button
              type="button"
              onClick={polishDesc}
              disabled={polishing || busy}
              className="mt-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-gold transition hover:text-saffron disabled:opacity-40"
            >
              {polishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
              {polishing ? 'Polishing…' : 'Polish with AI'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select
              className="input mt-2"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <div className="mt-2 flex gap-2">
              <input
                className="input flex-1"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="e.g. bold, minimal, colour"
              />
              <button
                type="button"
                onClick={quickTags}
                disabled={tagging || busy || !form.title.trim()}
                title="Suggest tags from title & category"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-saffron/30 bg-saffron/8 px-3 py-2 font-mono text-xs uppercase tracking-wider text-saffron transition hover:bg-saffron hover:text-white disabled:opacity-40"
              >
                {tagging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                {tagging ? '' : 'Suggest'}
              </button>
            </div>
          </div>
        </div>

        {/* License */}
        <div>
          <label className="label">License / Usage rights</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {LICENSE_OPTIONS.map(({ value, label, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('license', value)}
                title={hint}
                className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                  form.license === value
                    ? 'border-saffron bg-saffron text-white'
                    : 'border-ink/15 text-ink/60 hover:border-saffron/50 hover:text-saffron'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-ink/40">
            {LICENSE_OPTIONS.find((o) => o.value === form.license)?.hint}
          </p>
        </div>

        <button className="btn-saffron mt-2 self-start" disabled={busy}>
          {busy ? 'Publishing…' : 'Publish work'}
        </button>
        <p className="text-xs text-ink/40">
          On publish, your work is indexed for similarity search and personalised recommendations.
        </p>
      </form>
    </div>
  );
}
