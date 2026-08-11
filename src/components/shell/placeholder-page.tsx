export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        本页将在后续阶段交付完整实现。
      </p>
    </div>
  )
}
