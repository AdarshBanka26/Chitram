import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Bookmark, Eye, MessageCircle, Trash2, Sparkles, FolderPlus, Send } from 'lucide-react';
import Spinner from '../components/Spinner.jsx';
import WorkCard from '../components/WorkCard.jsx';
import { workApi, commentApi, boardApi, errMsg } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function WorkDetail() {
  const { id } = useParams();
  const { user, isAuthed } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [boards, setBoards] = useState([]);
  const [showBoards, setShowBoards] = useState(false);

  const uid = user?._id;
  const isOwner = work && uid && (work.owner?._id === uid || work.owner === uid);

  useEffect(() => {
    let active = true;
    setLoading(true);
    workApi
      .get(id)
      .then(({ work: w }) => {
        if (!active) return;
        setWork(w);
        setLikeCount(w.likeCount ?? 0);
        setLiked(Boolean(uid && w.likes?.some((l) => (l._id || l) === uid)));
        setSaved(Boolean(uid && w.savedBy?.some((s) => (s._id || s) === uid)));
      })
      .catch((err) => toast.error(errMsg(err)))
      .finally(() => active && setLoading(false));

    commentApi.list(id).then((r) => active && setComments(r.items || [])).catch(() => {});
    workApi.similar(id, 8).then((r) => active && setSimilar(r.items || [])).catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const guard = () => {
    if (!isAuthed) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const onLike = async () => {
    if (!guard()) return;
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await workApi.like(id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const onSave = async () => {
    if (!guard()) return;
    setSaved((v) => !v);
    try {
      const res = await workApi.save(id);
      setSaved(res.saved);
      toast.success(res.saved ? 'Saved' : 'Removed');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const openBoards = async () => {
    if (!guard()) return;
    try {
      const r = await boardApi.list({ mine: true });
      setBoards(r.items || []);
      setShowBoards(true);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const addToBoard = async (boardId) => {
    try {
      await boardApi.addWork(boardId, id);
      toast.success('Added to board');
      setShowBoards(false);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!guard() || !commentText.trim()) return;
    try {
      const { comment } = await commentApi.add(id, { text: commentText.trim() });
      setComments((c) => [...c, comment]);
      setCommentText('');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const deleteComment = async (cid) => {
    try {
      await commentApi.remove(cid);
      setComments((c) => c.filter((x) => x._id !== cid));
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const deleteWork = async () => {
    if (!window.confirm('Delete this work permanently?')) return;
    try {
      await workApi.remove(id);
      toast.success('Work deleted');
      navigate('/discover');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (loading) return <Spinner full />;
  if (!work) return null;

  return (
    <div className="container-x py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        {/* Media */}
        <div className="overflow-hidden rounded-card bg-cream ring-1 ring-ink/5">
          {work.type === 'image' && work.mediaUrl ? (
            <img src={work.mediaUrl} alt={work.title} className="w-full object-contain" />
          ) : (
            <div className="whitespace-pre-wrap p-8 font-display text-lg leading-relaxed text-ink">
              {work.textContent}
            </div>
          )}
        </div>

        {/* Meta */}
        <div>
          <span className="label">{work.category}</span>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight text-ink">{work.title}</h1>

          {work.owner?.username && (
            <Link to={`/u/${work.owner.username}`} className="mt-4 inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-magenta font-mono text-sm font-bold text-white">
                {work.owner.avatar ? (
                  <img src={work.owner.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  work.owner.name?.[0]?.toUpperCase()
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{work.owner.name}</span>
                <span className="block text-xs text-ink/50">@{work.owner.username}</span>
              </span>
            </Link>
          )}

          {work.description && <p className="mt-5 text-ink/70">{work.description}</p>}

          {/* Tags */}
          {(work.tags?.length || work.aiTags?.length) > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {work.tags?.map((t) => (
                <span key={`t-${t}`} className="rounded-full bg-ink/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink/60">
                  #{t}
                </span>
              ))}
              {work.aiTags?.map((t) => (
                <span key={`ai-${t}`} className="flex items-center gap-1 rounded-full bg-magenta/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-magenta">
                  <Sparkles className="h-3 w-3" /> {t}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 text-xs text-ink/40">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-magenta/40" />
              AI is indexing this work…
            </div>
          )}

          {/* License badge */}
          {work.license && (
            <div className="mt-4">
              <span className={`inline-block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
                work.license === 'free'
                  ? 'bg-saffron/10 text-saffron'
                  : work.license === 'commercial'
                  ? 'bg-gold/10 text-gold'
                  : 'bg-ink/8 text-ink/50'
              }`}>
                {work.license === 'free' ? 'Free to use'
                  : work.license === 'commercial' ? 'Commercial use'
                  : 'All rights reserved'}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 flex items-center gap-6 text-sm text-ink/50">
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {work.viewCount}</span>
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {likeCount}</span>
            <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {comments.length}</span>
          </div>

          {/* Actions */}
          <div className="relative mt-6 flex flex-wrap gap-3">
            <button onClick={onLike} className={`btn px-5 py-3 ${liked ? 'bg-magenta text-white' : 'border border-ink/15 text-ink'}`}>
              <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} /> {liked ? 'Liked' : 'Like'}
            </button>
            <button onClick={onSave} className={`btn px-5 py-3 ${saved ? 'bg-royal text-white' : 'border border-ink/15 text-ink'}`}>
              <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={openBoards} className="btn border border-ink/15 px-5 py-3 text-ink">
              <FolderPlus className="h-4 w-4" /> Add to board
            </button>
            {isOwner && (
              <button onClick={deleteWork} className="btn px-5 py-3 text-magenta hover:bg-magenta hover:text-white">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}

            {showBoards && (
              <div className="absolute top-full z-20 mt-2 w-64 rounded-xl border border-ink/10 bg-white p-2 shadow-soft">
                {boards.length === 0 ? (
                  <p className="p-3 text-sm text-ink/50">No boards yet. Create one in Collections.</p>
                ) : (
                  boards.map((b) => (
                    <button
                      key={b._id}
                      onClick={() => addToBoard(b._id)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-cream"
                    >
                      {b.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <section className="mt-16 max-w-2xl">
        <h2 className="font-display text-2xl font-bold">Comments</h2>
        <form onSubmit={submitComment} className="mt-4 flex gap-2">
          <input
            className="input"
            placeholder={isAuthed ? 'Add a comment…' : 'Log in to comment'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!isAuthed}
          />
          <button className="btn-dark px-4" disabled={!isAuthed}>
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 space-y-5">
          {comments.length === 0 && <p className="text-sm text-ink/40">Be the first to comment.</p>}
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/10 font-mono text-xs font-bold">
                {c.author?.name?.[0]?.toUpperCase() || '?'}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">@{c.author?.username}</span>
                  {(c.author?._id === uid || isOwner) && (
                    <button onClick={() => deleteComment(c._id)} className="text-ink/30 hover:text-magenta">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink/70">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Similar (AI) */}
      {similar.length > 0 && (
        <section className="mt-16">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-magenta" />
            <h2 className="font-display text-2xl font-bold">Similar works</h2>
          </div>
          <div className="masonry">
            {similar.map((w) => (
              <WorkCard key={w._id} work={w} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
