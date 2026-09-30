export interface User {
  id: number;
  full_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  role?: {
    id: number;
    name: string;
    description?: string | null;
  };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  default_value: boolean;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureRollout {
  id: number;
  feature_flag_id: number;
  environment_id: number;
  percentage: number;
  enabled: boolean;
  scheduled_start: string | null;
  scheduled_end: string | null;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface UserAssignment {
  id: number;
  user_id: number;
  feature_flag_id: number;
  enabled: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureUsage {
  id: number;
  feature_flag_id: number;
  environment_id: number;
  user_id: number | null;
  enabled: boolean;
  source: string;
  rollout_id: number | null;
  evaluated_at: string;
}

export interface FeatureAnalytics {
  feature_flag_id: number;
  feature_key: string;
  feature_name: string;
  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;
  enabled_percentage: number;
}

export interface EnvironmentAnalytics {
  environment_id: number;
  environment_name: string;
  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;
  enabled_percentage: number;
}

export interface AnalyticsSummary {
  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;
  enabled_percentage: number;
  unique_features: number;
  unique_users: number;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_features: number;
  enabled_features: number;
  disabled_features: number;

  total_environments: number;
  active_environments: number;
  inactive_environments: number;

  total_rollouts: number;
  active_rollouts: number;

  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;

  unique_users: number;
  recent_audit_logs: number;
}

export interface DashboardRecentActivity {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  user_id: number | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}