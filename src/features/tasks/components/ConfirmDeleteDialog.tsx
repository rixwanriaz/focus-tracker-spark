// src/features/tasks/components/ConfirmDeleteDialog.tsx
import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Task } from "@/types/task";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  task: Task | null;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  task,
}) => {
  if (!task) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Delete Task
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            This action cannot be undone. This will permanently delete the task and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Details */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="font-medium text-white mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Status: {task.status.replace("_", " ")}</span>
              <span>Priority: {task.priority}</span>
              {task.assignee && (
                <span>Assignee: {task.assignee.first_name} {task.assignee.last_name}</span>
              )}
            </div>
          </div>

          {/* Warning Alert */}
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <strong>Warning:</strong> Deleting this task will permanently remove it from the project.
              Any time logged against this task will also be removed.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
