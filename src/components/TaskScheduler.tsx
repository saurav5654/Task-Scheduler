
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle, CalendarIcon, Clock, Trash2, XCircle, ListTodo, Calendar as CalendarDayIcon } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { DayContent, DayContentProps } from "react-day-picker";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: Date;
}

export const TaskScheduler = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks).map((task: any) => ({
      ...task,
      date: new Date(task.date)
    })) : [];
  });
  const [newTask, setNewTask] = useState("");
  const [date, setDate] = useState<Date>(addDays(new Date(), 1));
  const [activeTab, setActiveTab] = useState("tomorrow");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === "") return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      date: date,
    };
    
    setTasks([...tasks, task]);
    setNewTask("");
    toast({
      title: "Task added",
      description: `"${newTask}" added for ${format(date, "EEEE, MMMM do")}`,
    });
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully",
      variant: "destructive",
    });
  };

  const tomorrow = addDays(new Date(), 1);
  const tomorrowTasks = tasks.filter(
    (task) => format(new Date(task.date), "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")
  );

  const isToday = (taskDate: Date) => {
    return format(new Date(taskDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  };

  const isTomorrow = (taskDate: Date) => {
    return format(new Date(taskDate), "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd");
  };

  const filteredTasks = (filterDate: Date) => {
    return tasks.filter(
      (task) => format(new Date(task.date), "yyyy-MM-dd") === format(filterDate, "yyyy-MM-dd")
    );
  };

  const hasTasksOnDate = (day: Date) => {
    return tasks.some(task => isSameDay(new Date(task.date), day));
  };

  const getTasksCountForDate = (day: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.date), day)).length;
  };
  
  // Custom day content component for the calendar
  const CustomDayContent = (props: DayContentProps) => {
    const { date: dayDate, displayMonth } = props;
    const taskCount = getTasksCountForDate(dayDate);
    const hasTask = taskCount > 0;
    const isSelected = isSameDay(dayDate, date);
    
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <span>{dayDate.getDate()}</span>
        {hasTask && !isSelected && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -bottom-1 w-full flex justify-center"
          >
            <div className="flex space-x-0.5">
              {taskCount > 3 ? (
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse-slow" />
              ) : (
                Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                  <motion.span 
                    key={i} 
                    className="h-1.5 w-1.5 rounded-full bg-violet-500" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className="p-4 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs 
        defaultValue="tomorrow" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="mb-4 grid grid-cols-3 bg-gradient-to-r from-violet-200 to-fuchsia-200 dark:from-violet-900 dark:to-fuchsia-900">
          <TabsTrigger 
            value="today"
            className="data-[state=active]:bg-white data-[state=active]:text-violet-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-violet-300"
          >
            <Clock className="h-4 w-4 mr-2" />
            Today
          </TabsTrigger>
          <TabsTrigger 
            value="tomorrow"
            className="data-[state=active]:bg-white data-[state=active]:text-violet-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-violet-300"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Tomorrow
          </TabsTrigger>
          <TabsTrigger 
            value="calendar"
            className="data-[state=active]:bg-white data-[state=active]:text-violet-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-violet-300"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="today" className="space-y-4">
              <TaskList 
                title="Today's Tasks" 
                tasks={filteredTasks(new Date())} 
                onToggle={toggleTaskCompletion}
                onDelete={deleteTask}
              />
            </TabsContent>
            
            <TabsContent value="tomorrow" className="space-y-4">
              <TaskList 
                title="Tomorrow's Tasks" 
                tasks={tomorrowTasks} 
                onToggle={toggleTaskCompletion}
                onDelete={deleteTask}
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-4">
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-violet-950">
                <CardHeader className="bg-gradient-to-r from-violet-400 to-fuchsia-400 dark:from-violet-800 dark:to-fuchsia-800 text-white">
                  <CardTitle>Schedule Tasks</CardTitle>
                  <CardDescription className="text-white dark:text-gray-200">Select a date to view or add tasks</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 items-center p-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-full"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      className="rounded-md border p-3 pointer-events-auto bg-white dark:bg-gray-800 shadow-lg"
                      classNames={{
                        day_today: "bg-accent text-accent-foreground font-semibold border border-violet-300 dark:border-violet-700",
                      }}
                      modifiersClassNames={{
                        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        today: "bg-accent text-accent-foreground font-semibold border border-violet-300 dark:border-violet-700",
                      }}
                      components={{
                        DayContent: CustomDayContent
                      }}
                    />
                  </motion.div>
                  <div className="w-full mt-4">
                    <h3 className="text-lg font-medium mb-2 text-violet-700 dark:text-violet-300 flex items-center gap-2">
                      <CalendarDayIcon className="h-5 w-5" />
                      Tasks for {format(date, "EEEE, MMMM do")}
                    </h3>
                    <TaskList 
                      title="" 
                      tasks={filteredTasks(date)} 
                      onToggle={toggleTaskCompletion}
                      onDelete={deleteTask}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="mt-6 border-none shadow-lg bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-violet-950">
          <CardHeader className="bg-gradient-to-r from-violet-400 to-fuchsia-400 dark:from-violet-800 dark:to-fuchsia-800 text-white">
            <CardTitle>Add a new task</CardTitle>
            <CardDescription className="text-white dark:text-gray-200">
              {isTomorrow(date) ? "For tomorrow" : 
              isToday(date) ? "For today" : 
              `For ${format(date, "EEEE, MMMM do")}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className="border-violet-200 focus-visible:ring-violet-400 dark:border-violet-700 dark:focus-visible:ring-violet-500"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={addTask} 
                  className="shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 dark:from-violet-600 dark:to-fuchsia-600 dark:hover:from-violet-700 dark:hover:to-fuchsia-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

interface TaskListProps {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskList = ({ title, tasks, onToggle, onDelete }: TaskListProps) => {
  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-violet-950">
      {title && (
        <CardHeader className="bg-gradient-to-r from-violet-400 to-fuchsia-400 dark:from-violet-800 dark:to-fuchsia-800 text-white">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-white dark:text-gray-200">{tasks.length} tasks</CardDescription>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {tasks.length === 0 ? (
          <motion.div 
            className="text-center py-10 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CalendarIcon className="h-16 w-16 mx-auto text-violet-200 dark:text-violet-800 mb-4" />
            <p className="text-violet-500 dark:text-violet-400">No tasks scheduled</p>
          </motion.div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-violet-100 dark:border-violet-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggle(task.id)}
                        className={task.completed ? "text-green-500" : "text-violet-400 dark:text-violet-300"}
                      >
                        <CheckCircle className={`h-5 w-5 transition-all ${task.completed ? "fill-green-500" : ""}`} />
                      </Button>
                    </motion.div>
                    <span className={`transition-all ${task.completed ? "line-through text-muted-foreground" : "text-violet-800 dark:text-violet-100"}`}>
                      {task.title}
                    </span>
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(task.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
