export type DashboardProjectStatus =
  | 'idea'
  | 'active'
  | 'paused'
  | 'blocked'
  | 'completed'
  | 'archived';

export type DashboardProjectPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface DashboardPhase {
  id: string;
  name: string;
  position: number;
}

export interface DashboardCheckpoint {
  id: string;
  whatDone: string;
  whatWorks: string;
  whatRemains: string;
  blockers: string;
  nextStep: string;
  createdAt: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  description: string | null;
  status: DashboardProjectStatus;
  priority: DashboardProjectPriority;
  currentPhase: DashboardPhase | null;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  latestCheckpoint: DashboardCheckpoint | null;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  pausedProjects: number;
}

export interface DashboardUser {
  id: string;
  name: string | null;
}