export function AdminErrorState({ message }: { message: string }) {
  return (
    <main className="p-6">
      <p className="text-destructive">Error: {message}</p>
    </main>
  )
}
