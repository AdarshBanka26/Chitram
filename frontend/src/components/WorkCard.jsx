import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, FileText } from 'lucide-react';
import { workApi, errMsg } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const CATEGORY_TINT = {
  art: 'bg-magenta',
  photography: 'bg-royal',
  writing: 'bg-olive',
  design: 'bg-ink',
  music: 'bg-magenta',
  other: 'bg-ink',
};

export default function WorkCard({ work }) {
  const { user, isAuthed } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const uid = user?._id;
  const [liked, setLiked] = useState(Boolean(uid && work.likes?.some((l) => (l._id || l) === uid)));
  const [saved, setSaved] = useState(Boolean(uid && work.savedBy?.some((s) => (s._id || s) === uid)));
  const [likeCount, setLikeCount] = useState(work.likeCount ?? work.likes?.length ?? 0);
  const [busy, setBusy] = useState(false);

  const requireAuth = () => {
    if (!isAuthed) {
      toast.info('Log in to interact with works');
      navigate('/login');
      return false;
    }
    return true;
  };

  const onLike = async (e) => {
    e.preventDefault();
    if (!requireAuth() || busy) return;
    setBusy(true);
    // optimistic
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await workApi.like(work._id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? 1 : -1));
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!requireAuth() || busy) return;
    setBusy(true);
    setSaved((v) => !v);
    try {
      const res = await workApi.save(work._id);
      setSaved(res.saved);
      toast.success(res.saved ? 'Saved' : 'Removed from saved');
    } catch (err) {
      setSaved((v) => !v);
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const tint = CATEGORY_TINT[work.category] || 'bg-ink';

  return (
    <Link
      to={`/works/${work._id}`}
      className="group block overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        {work.type === 'image' && work.mediaUrl ? (
          <img
            src={work.thumbnailUrl || work.mediaUrl}
            alt={work.title}
            loading="lazy"
            className="w-full object-cover"
          />
        ) : (
          <div className={`flex min-h-[220px] flex-col justify-between p-6 text-white ${tint}`}>
            <FileText className="h-6 w-6 opacity-80" />
            <p className="font-display text-lg font-semibold leading-snug line-clamp-5">
              {work.textContent ? work.textContent.slice(0, 180) : work.description}
            </p>
          </div>
        )}

        {/* Hover action bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={onSave}
            className={`pointer-events-auto grid h-9 w-9 place-items-center rounded-full backdrop-blur ${
              saved ? 'bg-royal text-white' : 'bg-white/90 text-ink hover:bg-white'
            }`}
            title="Save"
          >
            <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="label">{work.category}</span>
          <button
            onClick={onLike}
            className={`pointer-events-auto flex items-center gap-1 text-xs ${liked ? 'text-magenta' : 'text-ink/50 hover:text-magenta'}`}
          >
            <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
            {likeCount}
          </button>
        </div>
        <h3 className="font-display text-base font-bold leading-tight text-ink line-clamp-1">{work.title}</h3>
        {work.owner?.username && (
          <p className="mt-1 text-xs text-ink/50">by @{work.owner.username}</p>
        )}
      </div>
    </Link>
  );
}
