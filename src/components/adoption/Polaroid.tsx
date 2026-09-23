export function Polaroid({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-card p-2 shadow-xl ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full rounded-xl object-cover"
      />
    </div>
  );
}
