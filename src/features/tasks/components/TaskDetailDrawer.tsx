// src/features/tasks/components/TaskDetailDrawer.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MessageSquare, PlusCircle, Subscript, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, CreateTaskRequest } from "@/types/task";
import { useTask, useSubtasks, useTaskComments, useCreateComment, useUpdateTask, useUpdateTaskStatus, useCreateTask, useDeleteTask, taskKeys } from "@/hooks/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { TaskFormDialog } from "./TaskFormDialog";

interface ProjectMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TaskDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  projectId: string;
  projectMembers?: ProjectMember[];
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  open,
  onOpenChange,
  taskId,
  projectId,
  projectMembers = [],
}) => {
  const { data: task, isLoading } = useTask(taskId || "");
  const { data: subtasks = [] } = useSubtasks(taskId || "");
  const { data: comments = [] } = useTaskComments(taskId || "");
  const updateTaskMutation = useUpdateTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const createCommentMutation = useCreateComment(taskId || "");
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("details");
  const [commentBody, setCommentBody] = useState("");
  const [newSubtaskOpen, setNewSubtaskOpen] = useState(false);

  const handleCreateSubtask = async (data: Omit<CreateTaskRequest, "project_id">) => {
    if (!taskId) return;
    await createTaskMutation.mutateAsync({
      projectId,
      data: { ...data, parent_task_id: taskId, project_id: projectId } as CreateTaskRequest,
    });
    // Refresh subtasks list for this task
    queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) });
    setNewSubtaskOpen(false);
    setActiveTab("subtasks");
  };

  const handleSaveBasic = async (updates: Partial<Task> & { id?: string }) => {
    const targetTaskId = updates.id || taskId;
    if (!targetTaskId) return;

    // Remove the id from updates as it's not part of the API payload
    const { id, ...updateData } = updates;

    const updatedTask = await updateTaskMutation.mutateAsync({ taskId: targetTaskId, data: updateData });

    // Refresh subtasks list if this was a subtask update
    if (updates.id && taskId) {
      // Optimistically update the subtask list
      queryClient.setQueryData(taskKeys.subtasks(taskId), (prev: Task[] | undefined) => {
        if (!prev) return prev;
        return prev.map(t => (t.id === targetTaskId ? (updatedTask as Task) : t));
      });
      // And also invalidate to refetch from server
      queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await deleteTaskMutation.mutateAsync(subtaskId);
    // Refresh subtasks list
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) });
    }
  };

  const handleAddComment = async () => {
    if (!taskId || !commentBody.trim()) return;
    await createCommentMutation.mutateAsync(commentBody.trim());
    setCommentBody("");
    setActiveTab("comments");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-gray-900 border-gray-700 text-white">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center justify-between gap-3">
            <span>{task?.title || "Task"}</span>
            <div className="flex items-center gap-2">
              {task && (
                <Badge variant="secondary" className="text-xs">
                  {task.status.replace("_", " ")}
                </Badge>
              )}
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerTitle>
          {task?.description && (
            <DrawerDescription className="text-gray-400">{task.description}</DrawerDescription>
          )}
        </DrawerHeader>

        <Separator className="bg-gray-700" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left: editable summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 space-y-4">
                {task && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Status</label>
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleSaveBasic({ status: value as Task["status"] })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="not_started">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                      <Select
                        value={task.priority}
                        onValueChange={(value) => handleSaveBasic({ priority: value as Task["priority"] })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Assignee</label>
                      <Select
                        value={task.assignee_id || "unassigned"}
                        onValueChange={(value) => handleSaveBasic({ assignee_id: value === "unassigned" ? undefined : value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {projectMembers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
                      <Input
                        type="date"
                        value={task.due_date || ""}
                        onChange={(e) => handleSaveBasic({ due_date: e.target.value || undefined })}
                        className="bg-gray-700 border-gray-600 text-gray-200 h-8"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Title</label>
                      <Input
                        value={task?.title || ""}
                        onChange={(e) => handleSaveBasic({ title: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Description</label>
                      <Textarea
                        value={task?.description || ""}
                        onChange={(e) => handleSaveBasic({ description: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-gray-200"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="subtasks" className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300">Subtasks</h3>
                  <Button size="sm" onClick={() => setNewSubtaskOpen(true)} className="gap-2">
                    <PlusCircle className="h-4 w-4" /> New Subtask
                  </Button>
                </div>
                <div className="space-y-2">
                  {subtasks.map((st) => (
                    <Card key={st.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-sm font-semibold text-white">{st.title}</h4>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs px-2 py-0.5",
                                  st.status === "completed" && "bg-green-600/20 text-green-400",
                                  st.status === "in_progress" && "bg-blue-600/20 text-blue-400",
                                  st.status === "blocked" && "bg-red-600/20 text-red-400",
                                  st.status === "not_started" && "bg-yellow-600/20 text-yellow-400"
                                )}
                              >
                                {st.status.replace("_", " ")}
                              </Badge>
                            </div>

                            {st.description && (
                              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{st.description}</p>
                            )}

                            <div className="flex items-center gap-3 flex-wrap">
                              {(st.assignee || projectMembers.find(m => m.id === st.assignee_id)) && (
                                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-blue-500/10 text-blue-300">
                                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">
                                      {(st.assignee?.first_name || projectMembers.find(m => m.id === st.assignee_id)?.first_name)?.charAt(0)}
                                      {(st.assignee?.last_name || projectMembers.find(m => m.id === st.assignee_id)?.last_name)?.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {(st.assignee?.first_name || projectMembers.find(m => m.id === st.assignee_id)?.first_name)} {(st.assignee?.last_name || projectMembers.find(m => m.id === st.assignee_id)?.last_name)}
                                  </span>
                                </div>
                              )}

                              {st.priority && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs px-2 py-0.5",
                                    st.priority === "high" && "bg-red-600/20 text-red-400",
                                    st.priority === "medium" && "bg-yellow-600/20 text-yellow-400",
                                    st.priority === "low" && "bg-green-600/20 text-green-400"
                                  )}
                                >
                                  {st.priority}
                                </Badge>
                              )}

                              {st.due_date && (
                                <div className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                                  new Date(st.due_date) < new Date() && st.status !== "completed"
                                    ? "bg-red-600/10 text-red-400"
                                    : "bg-gray-600/10 text-gray-400"
                                )}>
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(st.due_date).toLocaleDateString()}</span>
                                </div>
                              )}

                              {st.estimate_seconds && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-600/10 text-gray-400 text-xs">
                                  <Clock className="h-3 w-3" />
                                  <span>{Math.floor(st.estimate_seconds / 3600)}h {Math.floor((st.estimate_seconds % 3600) / 60)}m</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-2 flex-wrap justify-end">
                            {/* Quick Status Update */}
                            <Select
                              value={st.status}
                              onValueChange={(value) => handleSaveBasic({ status: value, id: st.id })}
                            >
                              <SelectTrigger className="h-7 min-w-[90px] bg-gray-700 border-gray-600 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="not_started" className="text-xs">To Do</SelectItem>
                                <SelectItem value="in_progress" className="text-xs">In Progress</SelectItem>
                                <SelectItem value="blocked" className="text-xs">Blocked</SelectItem>
                                <SelectItem value="completed" className="text-xs">Done</SelectItem>
                                <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Quick Priority Update */}
                            <Select
                              value={st.priority}
                              onValueChange={(value) => handleSaveBasic({ priority: value, id: st.id })}
                            >
                              <SelectTrigger className="h-7 min-w-[80px] bg-gray-700 border-gray-600 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="low" className="text-xs">Low</SelectItem>
                                <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                                <SelectItem value="high" className="text-xs">High</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Quick Assignee Update */}
                            <Select
                              value={st.assignee_id || "unassigned"}
                              onValueChange={(value) => handleSaveBasic({
                                assignee_id: value === "unassigned" ? undefined : value,
                                id: st.id
                              })}
                            >
                              <SelectTrigger className="h-7 min-w-[110px] bg-gray-700 border-gray-600 text-xs">
                                <SelectValue placeholder="Assign" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
                                {projectMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id} className="text-xs">
                                    {member.first_name} {member.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`Delete subtask "${st.title}"?`)) {
                                  handleDeleteSubtask(st.id);
                                }
                              }}
                              className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              title="Delete subtask"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {subtasks.length === 0 && (
                    <div className="text-sm text-gray-400">No subtasks yet.</div>
                  )}
                </div>

                {task && (
                  <TaskFormDialog
                    open={newSubtaskOpen}
                    onOpenChange={setNewSubtaskOpen}
                    onSubmit={handleCreateSubtask}
                    loading={createTaskMutation.isLoading}
                    projectId={projectId}
                    projectMembers={projectMembers}
                    parentTask={task}
                    mode="create"
                  />
                )}
              </TabsContent>
              <TabsContent value="comments" className="mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    {comments.map((c) => (
                      <Card key={c.id} className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-3">
                          <div className="text-xs text-gray-500 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                          <div className="text-sm text-gray-200 whitespace-pre-wrap">{c.body}</div>
                        </CardContent>
                      </Card>
                    ))}
                    {comments.length === 0 && <div className="text-sm text-gray-400">No comments yet.</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!commentBody.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: meta */}
          <div className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 space-y-2 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span className="text-gray-400">{task ? new Date(task.created_at).toLocaleString() : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Updated</span>
                  <span className="text-gray-400">{task ? new Date(task.updated_at).toLocaleString() : "—"}</span>
                </div>
                {task?.completed_at && (
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <span className="text-gray-400">{new Date(task.completed_at).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
