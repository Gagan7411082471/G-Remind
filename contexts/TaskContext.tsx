// contexts/TaskContext.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Task, CategoryResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { mockCategorizeTask } from '../utils/categorization';

interface TaskState {
  tasks: Task[];
  categorizing: boolean;
  error: string | null;
}

type TaskAction =
  | { type: 'SET_CATEGORIZING'; payload: boolean }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_TASKS'; payload: Task[] };

interface TaskContextValue extends TaskState {
  addTask: (text: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_CATEGORIZING':
      return { ...state, categorizing: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_TASKS':
      return { ...state, tasks: action.payload };
    default:
      return state;
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    categorizing: false,
    error: null,
  });

  const addTask = useCallback(async (text: string) => {
    if (text.trim() === '') return;

    dispatch({ type: 'SET_CATEGORIZING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { category, googlePlaceType } = await mockCategorizeTask(text);
      
      const newTask: Task = {
        id: uuidv4(),
        text: text.trim(),
        completed: false,
        category,
        googlePlaceType,
        linkedShop: null,
        lastNotifiedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      console.error('Error categorizing task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to categorize task' });
      
      // Fallback task
      const fallbackTask: Task = {
        id: uuidv4(),
        text: text.trim(),
        completed: false,
        category: 'Uncategorized',
        googlePlaceType: null,
        linkedShop: null,
        lastNotifiedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TASK', payload: fallbackTask });
    } finally {
      dispatch({ type: 'SET_CATEGORIZING', payload: false });
    }
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { completed: !task.completed });
    }
  }, [state.tasks, updateTask]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
