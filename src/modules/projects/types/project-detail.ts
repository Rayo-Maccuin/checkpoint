export type ProjectDetailStatus =
  | 'idea'
  | 'active'
  | 'paused'
  | 'blocked'
  | 'completed'
  | 'archived';

export type ProjectDetailPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type ProjectDetailTaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'cancelled';

export type ProjectDetailTaskPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type ProjectDetailMemberRole =
  | 'owner'
  | 'collaborator'
  | 'viewer';

export interface ProjectDetailMember {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  role: ProjectDetailMemberRole;
}

export interface ProjectDetailPhase {
  id: string;
  name: string;
  description: string | null;
  position: number;
}

export interface ProjectDetailTask {
  id: string;
  title: string;
  description: string | null;
  status: ProjectDetailTaskStatus;
  priority: ProjectDetailTaskPriority;
  phaseId: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  createdBy: string;
  createdByName: string | null;
  completedBy: string | null;
  completedByName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ProjectDetailCheckpoint {
  id: string;
  phaseId: string | null;
  whatDone: string;
  whatWorks: string;
  whatRemains: string;
  blockers: string;
  nextStep: string;
  createdAt: string;
}

export interface ProjectDetailActivity {
  id: string;
  type: string;
  userName: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: ProjectDetailStatus;
  priority: ProjectDetailPriority;
  currentPhaseId: string | null;
  currentPhase: ProjectDetailPhase | null;
  phases: ProjectDetailPhase[];
  tasks: ProjectDetailTask[];
  checkpoints: ProjectDetailCheckpoint[];
  activities: ProjectDetailActivity[];
  members: ProjectDetailMember[];
  currentUserId: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  latestCheckpoint: ProjectDetailCheckpoint | null;
}

export interface GetProjectDetailSuccess {
  success: true;
  project: ProjectDetail;
}

export interface GetProjectDetailError {
  success: false;
  message: string;
}

export type GetProjectDetailResult =
  | GetProjectDetailSuccess
  | GetProjectDetailError;