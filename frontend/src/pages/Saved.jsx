import { useEffect, useState } from 'react';
import MasonryGrid from '../components/MasonryGrid.jsx';
import Spinner from '../components/Spinner.jsx';
import { userApi, errMsg } from '../api/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Saved() {
  const toast = useToast();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi
      .dashboard()
      .then((r) => setWorks(r.dashboard?.saved || []))
      .catch((err) => toast.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="container-x py-12">
      <p className="label">Your Bookmarks</p>
      <h1 className="mt-2 font-display text-4xl font-black text-ink sm:text-5xl">Saved</h1>
      <div className="mt-10">
        {loading ? (
          <Spinner label="Loading saved" />
        ) : (
          <MasonryGrid works={works} emptyMessage="You haven't saved any works yet." />
        )}
      </div>
    </div>
  );
}
