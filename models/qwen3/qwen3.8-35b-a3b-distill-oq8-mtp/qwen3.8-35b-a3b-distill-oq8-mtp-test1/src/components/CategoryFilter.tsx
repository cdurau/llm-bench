interface Props {
  categories: string[];
  selectedCategory: string | null;
  onFilter: (cat: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onFilter }: Props) {
  if (categories.length === 0) return null;

  return (
    <nav className="category-nav" aria-label="Kategorie-Filter">
      <button
        className={`cat-filter-btn${selectedCategory === null ? ' active' : ''}`}
        onClick={() => onFilter(null)}
      >
        Alle
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`cat-filter-btn${selectedCategory === cat ? ' active' : ''}`}
          onClick={() => onFilter(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}
