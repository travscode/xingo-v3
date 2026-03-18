interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display text-4xl leading-tight font-semibold tracking-tight text-balance">
        {title}
      </h2>
      <p className="text-base leading-7 text-muted">{description}</p>
    </div>
  );
}
