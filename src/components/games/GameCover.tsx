const covers = import.meta.glob("/src/assets/game-covers/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

export const GameCover = ({ slug, title }: { slug: string; title: string }) => {
  const coverSlug = slug === "wheel" ? "spin-win" : slug;
  return <img src={covers[`/src/assets/game-covers/${coverSlug}.jpg`]} alt={title} width={480} height={480} loading="lazy" className="w-full aspect-square object-cover" />;
};