/** Button label while an action runs: spinner + what is happening (no "…"). */
export default function Busy({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      {text}
    </span>
  );
}
