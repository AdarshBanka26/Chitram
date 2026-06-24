import WorkCard from './WorkCard.jsx';
import EmptyState from './EmptyState.jsx';

export default function MasonryGrid({ works = [], emptyMessage = 'Nothing here yet.' }) {
  if (!works.length) return <EmptyState message={emptyMessage} />;
  return (
    <div className="masonry">
      {works.map((w) => (
        <WorkCard key={w._id} work={w} />
      ))}
    </div>
  );
}
