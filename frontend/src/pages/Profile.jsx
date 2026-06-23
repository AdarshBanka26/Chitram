import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, UserCheck } from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid.jsx';
import Spinner from '../components/Spinner.jsx';
import { userApi, workApi, errMsg } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user, isAuthed } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    userApi
      .profile(username)
      .then((r) => {
        if (!active) return;
        setProfile(r.profile);
        setFollowing(Boolean(user && r.profile.followers?.some((f) => (f._id || f) === user._id)));
        return workApi.list({ owner: r.profile._id, limit: 50 });
      })
      .then((r) => active && r && setWorks(r.items || []))
      .catch((err) => toast.error(errMsg(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const toggleFollow = async () => {
    if (!isAuthed) return toast.info('Log in to follow');
    try {
      const res = await userApi.follow(profile._id);
      setFollowing(res.following);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (loading) return <Spinner full />;
  if (!profile) return null;

  const isMe = user?._id === profile._id;

  return (
    <div className="container-x py-12">
      <div className="flex flex-col items-center text-center">
        {/* Avatar with saffron-gold ring */}
        <div className="p-[3px] rounded-full bg-gradient-to-br from-saffron via-gold to-saffron">
          <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-magenta to-royal font-display text-3xl font-black text-white">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="h-full w-full object-cover" />
            ) : (
              profile.name?.[0]?.toUpperCase()
            )}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-black text-ink">{profile.name}</h1>
        <p className="text-saffron/70 font-mono text-xs tracking-widest">@{profile.username}</p>
        {profile.bio && <p className="mt-3 max-w-md text-ink/70">{profile.bio}</p>}

        {/* Stats row */}
        <div className="mt-6 flex gap-8 rounded-2xl border border-saffron/15 bg-saffron/4 px-8 py-4 font-mono text-xs uppercase tracking-wider text-ink/50">
          <span><b className="font-display text-base text-ink">{profile.stats?.works ?? 0}</b><br />works</span>
          <span className="w-px bg-saffron/20" />
          <span><b className="font-display text-base text-ink">{profile.stats?.followers ?? 0}</b><br />followers</span>
          <span className="w-px bg-saffron/20" />
          <span><b className="font-display text-base text-ink">{profile.stats?.following ?? 0}</b><br />following</span>
        </div>

        {!isMe && (
          <button onClick={toggleFollow} className={`mt-6 ${following ? 'btn-outline' : 'btn-saffron'}`}>
            {following ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
          </button>
        )}
      </div>

      {/* Saffron divider */}
      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-saffron/30 to-transparent" />
        <span className="font-brand text-sm text-saffron/50">कृतियाँ</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-saffron/30 to-transparent" />
      </div>

      <MasonryGrid works={works} emptyMessage="No public works yet." />
    </div>
  );
}
