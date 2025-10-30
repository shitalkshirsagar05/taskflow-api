import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "./TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "done";
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface TaskListProps {
  userId: string;
  isAdmin: boolean;
}

export const TaskList = ({ userId, isAdmin }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");

  useEffect(() => {
    fetchTasks();
  }, [userId, isAdmin]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data as Task[]) || []);
    } catch (error: any) {
      toast.error("Error loading tasks");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const filteredTasks = tasks.filter((task) => 
    filter === "all" ? true : task.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="todo">
            To Do ({tasks.filter(t => t.status === "todo").length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({tasks.filter(t => t.status === "in-progress").length})
          </TabsTrigger>
          <TabsTrigger value="done">
            Done ({tasks.filter(t => t.status === "done").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userId={userId}
                  isAdmin={isAdmin}
                  onUpdate={handleTaskUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
