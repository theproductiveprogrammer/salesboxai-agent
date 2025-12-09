import { useState } from 'react'
import { useSalesbot } from '@/hooks/useSalesbot'
import ViewSalesbot from './dialogs/ViewSalesbot'
import { IconSettings, IconAlertCircle } from '@tabler/icons-react'
import { AvatarEmoji } from '@/containers/AvatarEmoji'

const DropdownAssistant = () => {
  const { salesbot, isLoading, error } = useSalesbot()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Show error state if no salesbot
  if (error) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 py-1 px-2 rounded-sm">
        <IconAlertCircle size={16} className="text-destructive shrink-0" />
        <span className="text-destructive text-sm truncate max-w-40">
          {error}
        </span>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-primary/8 py-1 px-2 rounded-sm animate-pulse">
        <span className="shrink-0 w-4 h-4 bg-primary/20 rounded" />
        <span className="h-4 w-24 bg-primary/20 rounded" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 bg-primary/8 py-1 hover:bg-primary/12 px-2 rounded-sm">
        <div className="font-medium flex items-center gap-1.5 max-w-40">
          <div className="text-primary flex items-center gap-1">
            <span className="shrink-0 w-4 h-4 relative flex items-center justify-center">
              <AvatarEmoji
                avatar="/images/assistants/salesboxai.svg"
                imageClassName="object-cover"
                textClassName="text-sm"
              />
            </span>
            <div className="truncate max-w-30">
              <span>{salesbot?.name || 'Sales Assistant'}</span>
            </div>
          </div>
        </div>
        <div
          className="size-5 cursor-pointer relative z-10 flex items-center justify-center rounded hover:bg-primary/10 transition-all duration-200 ease-in-out"
          onClick={() => setDialogOpen(true)}
        >
          <IconSettings
            size={16}
            className="text-primary/70"
            title="View Assistant Details"
          />
        </div>
      </div>
      <ViewSalesbot
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        salesbot={salesbot}
      />
    </>
  )
}

export default DropdownAssistant
