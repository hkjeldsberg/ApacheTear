import { EditorSkeleton } from '@/components/ui/Skeleton'

export default function NoteLoading(): React.JSX.Element {
  return (
    <div className="h-full overflow-hidden">
      <EditorSkeleton />
    </div>
  )
}
