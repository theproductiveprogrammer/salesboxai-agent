import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AvatarEmoji } from '@/containers/AvatarEmoji'
import type { SalesbotInfo } from '@/services/salesboxApi'

interface ViewSalesbotProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salesbot: SalesbotInfo | null
}

export default function ViewSalesbot({
  open,
  onOpenChange,
  salesbot,
}: ViewSalesbotProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sales Assistant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Avatar and Name */}
          <div className="flex items-center gap-3">
            <div className="border rounded-sm p-2 w-10 h-10 flex items-center justify-center border-main-view-fg/10">
              <AvatarEmoji
                avatar="👋"
                imageClassName="w-6 h-6 object-contain"
                textClassName="text-xl"
              />
            </div>
            <div>
              <div className="font-medium text-lg">
                {salesbot?.name || 'Sales Assistant'}
              </div>
              <div className="text-sm text-main-view-fg/60">
                Your personal sales assistant
              </div>
            </div>
          </div>

          {/* Goal (shown as Description) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-main-view-fg/80">
              Goal
            </label>
            <div className="p-3 bg-main-view-fg/5 rounded-md min-h-[60px]">
              <p className="text-sm text-main-view-fg/70 whitespace-pre-wrap">
                {salesbot?.goal || 'No goal set'}
              </p>
            </div>
          </div>

          {/* Backstory (shown as Instructions) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-main-view-fg/80">
              Backstory
            </label>
            <div className="p-3 bg-main-view-fg/5 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
              <p className="text-sm text-main-view-fg/70 whitespace-pre-wrap">
                {salesbot?.backstory || 'No backstory set'}
              </p>
            </div>
          </div>

          <div className="text-xs text-main-view-fg/50 italic">
            To modify your sales assistant, please visit the SalesBox.AI web
            application.
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
