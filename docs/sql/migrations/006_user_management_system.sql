-- Migration: Comprehensive User Management System
-- This migration adds profiles, roles, groups, and permissions for industry-grade user management

-- ============================================
-- 1. ROLES TABLE - Custom role definitions
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- System roles (admin, employee) cannot be deleted
  level INTEGER DEFAULT 0, -- Hierarchy level (higher = more permissions)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system roles
INSERT INTO public.roles (name, display_name, description, is_system_role, level) VALUES
  ('admin', 'Administrator', 'Full system access with all permissions', true, 100),
  ('employee', 'Employee', 'Standard employee access', true, 10),
  ('manager', 'Manager', 'Management role with elevated permissions', false, 50),
  ('viewer', 'Viewer', 'Read-only access', false, 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. PERMISSIONS TABLE - Granular permissions
-- ============================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL, -- e.g., 'leads', 'users', 'companies'
  action TEXT NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'manage'
  description TEXT,
  category TEXT, -- e.g., 'Sales', 'Management', 'Administration'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint on resource + action
CREATE UNIQUE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions(resource, action);

-- Insert default permissions
INSERT INTO public.permissions (resource, action, description, category) VALUES
  -- User Management
  ('users', 'read', 'View users', 'Administration'),
  ('users', 'create', 'Create new users', 'Administration'),
  ('users', 'update', 'Update user information', 'Administration'),
  ('users', 'delete', 'Delete users', 'Administration'),
  ('users', 'manage', 'Full user management access', 'Administration'),
  
  -- Leads Management
  ('leads', 'read', 'View leads', 'Sales'),
  ('leads', 'create', 'Create leads', 'Sales'),
  ('leads', 'update', 'Update leads', 'Sales'),
  ('leads', 'delete', 'Delete leads', 'Sales'),
  ('leads', 'assign', 'Assign leads to users', 'Sales'),
  ('leads', 'manage', 'Full leads management', 'Sales'),
  
  -- Companies Management
  ('companies', 'read', 'View companies', 'Sales'),
  ('companies', 'create', 'Create companies', 'Sales'),
  ('companies', 'update', 'Update companies', 'Sales'),
  ('companies', 'delete', 'Delete companies', 'Sales'),
  ('companies', 'manage', 'Full companies management', 'Sales'),
  
  -- Quotations Management
  ('quotations', 'read', 'View quotations', 'Sales'),
  ('quotations', 'create', 'Create quotations', 'Sales'),
  ('quotations', 'update', 'Update quotations', 'Sales'),
  ('quotations', 'delete', 'Delete quotations', 'Sales'),
  ('quotations', 'approve', 'Approve quotations', 'Sales'),
  ('quotations', 'manage', 'Full quotations management', 'Sales'),
  
  -- Orders Management
  ('orders', 'read', 'View orders', 'Sales'),
  ('orders', 'create', 'Create orders', 'Sales'),
  ('orders', 'update', 'Update orders', 'Sales'),
  ('orders', 'delete', 'Delete orders', 'Sales'),
  ('orders', 'manage', 'Full orders management', 'Sales'),
  
  -- Team Management
  ('team', 'read', 'View team members', 'Management'),
  ('team', 'manage', 'Manage team members and departments', 'Management'),
  
  -- Analytics & Reports
  ('analytics', 'read', 'View analytics and reports', 'Management'),
  ('analytics', 'export', 'Export analytics data', 'Management'),
  
  -- System Settings
  ('settings', 'read', 'View system settings', 'Administration'),
  ('settings', 'update', 'Update system settings', 'Administration'),
  
  -- Roles & Permissions Management
  ('roles', 'read', 'View roles', 'Administration'),
  ('roles', 'create', 'Create roles', 'Administration'),
  ('roles', 'update', 'Update roles', 'Administration'),
  ('roles', 'delete', 'Delete roles', 'Administration'),
  ('roles', 'manage', 'Full roles management', 'Administration'),
  
  -- Groups Management
  ('groups', 'read', 'View groups', 'Administration'),
  ('groups', 'create', 'Create groups', 'Administration'),
  ('groups', 'update', 'Update groups', 'Administration'),
  ('groups', 'delete', 'Delete groups', 'Administration'),
  ('groups', 'manage', 'Full groups management', 'Administration')
ON CONFLICT (resource, action) DO NOTHING;

-- ============================================
-- 3. ROLE PERMISSIONS - Link roles to permissions
-- ============================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Grant admin all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Grant employee basic permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM public.roles r, public.permissions p
WHERE r.name = 'employee'
  AND (
    (p.resource = 'leads' AND p.action IN ('read', 'create', 'update'))
    OR (p.resource = 'quotations' AND p.action IN ('read', 'create', 'update'))
    OR (p.resource = 'orders' AND p.action IN ('read', 'create'))
    OR (p.resource = 'companies' AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. GROUPS TABLE - User groups/organizations
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Color code for UI
  icon TEXT, -- Icon identifier
  is_active BOOLEAN DEFAULT true,
  parent_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL, -- For nested groups
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. GROUP PERMISSIONS - Link groups to permissions
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_permissions (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, permission_id)
);

-- ============================================
-- 6. USER GROUPS - Link users to groups
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_groups (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Primary group for the user
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, group_id)
);

-- ============================================
-- 7. USER ROLES - Link users to roles (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Primary role for the user
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES public.users(id),
  PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- 8. EXTEND USER PROFILES TABLE
-- ============================================
-- Add additional fields to users table if they don't exist
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- 9. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.permissions(resource);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_groups_name ON public.groups(name);
CREATE INDEX IF NOT EXISTS idx_groups_parent ON public.groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_user_id ON public.user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group_id ON public.user_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_group_id ON public.group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_permission_id ON public.group_permissions(permission_id);

-- ============================================
-- 10. HELPER FUNCTIONS FOR PERMISSIONS
-- ============================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  -- Check if user has permission through roles
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
      AND rp.granted = true
  ) INTO has_permission;
  
  -- If found through roles, return true
  IF has_permission THEN
    RETURN true;
  END IF;
  
  -- Check if user has permission through groups
  SELECT EXISTS (
    SELECT 1
    FROM public.user_groups ug
    JOIN public.group_permissions gp ON ug.group_id = gp.group_id
    JOIN public.permissions p ON gp.permission_id = p.id
    WHERE ug.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
      AND gp.granted = true
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(
  resource TEXT,
  action TEXT,
  granted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  -- Permissions from roles
  SELECT DISTINCT
    p.resource,
    p.action,
    true as granted
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
    AND rp.granted = true
  
  UNION
  
  -- Permissions from groups
  SELECT DISTINCT
    p.resource,
    p.action,
    true as granted
  FROM public.user_groups ug
  JOIN public.group_permissions gp ON ug.group_id = gp.group_id
  JOIN public.permissions p ON gp.permission_id = p.id
  WHERE ug.user_id = p_user_id
    AND gp.granted = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's roles
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE(
  role_id UUID,
  role_name TEXT,
  display_name TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.display_name,
    ur.is_primary
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
  ORDER BY ur.is_primary DESC, r.level DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's groups
CREATE OR REPLACE FUNCTION get_user_groups(p_user_id UUID)
RETURNS TABLE(
  group_id UUID,
  group_name TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.name,
    ug.is_primary
  FROM public.user_groups ug
  JOIN public.groups g ON ug.group_id = g.id
  WHERE ug.user_id = p_user_id
    AND g.is_active = true
  ORDER BY ug.is_primary DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Service role can manage roles"
  ON public.roles FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view roles"
  ON public.roles FOR SELECT
  USING (get_current_clerk_user_id() IS NOT NULL OR get_current_clerk_user_id() IS NULL);

CREATE POLICY "Admins can manage roles"
  ON public.roles FOR ALL
  USING (is_admin(get_current_clerk_user_id()))
  WITH CHECK (is_admin(get_current_clerk_user_id()));

-- Permissions policies
CREATE POLICY "Service role can manage permissions"
  ON public.permissions FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view permissions"
  ON public.permissions FOR SELECT
  USING (get_current_clerk_user_id() IS NOT NULL OR get_current_clerk_user_id() IS NULL);

-- Groups policies
CREATE POLICY "Service role can manage groups"
  ON public.groups FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view groups"
  ON public.groups FOR SELECT
  USING (get_current_clerk_user_id() IS NOT NULL OR get_current_clerk_user_id() IS NULL);

CREATE POLICY "Admins can manage groups"
  ON public.groups FOR ALL
  USING (is_admin(get_current_clerk_user_id()))
  WITH CHECK (is_admin(get_current_clerk_user_id()));

-- User groups policies
CREATE POLICY "Service role can manage user groups"
  ON public.user_groups FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view own groups"
  ON public.user_groups FOR SELECT
  USING (
    user_id = get_user_id_from_clerk(get_current_clerk_user_id())
    OR is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

CREATE POLICY "Admins can manage user groups"
  ON public.user_groups FOR ALL
  USING (is_admin(get_current_clerk_user_id()))
  WITH CHECK (is_admin(get_current_clerk_user_id()));

-- User roles policies
CREATE POLICY "Service role can manage user roles"
  ON public.user_roles FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (
    user_id = get_user_id_from_clerk(get_current_clerk_user_id())
    OR is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (is_admin(get_current_clerk_user_id()))
  WITH CHECK (is_admin(get_current_clerk_user_id()));

-- Role permissions policies
CREATE POLICY "Service role can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (get_current_clerk_user_id() IS NOT NULL OR get_current_clerk_user_id() IS NULL);

CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (is_admin(get_current_clerk_user_id()))
  WITH CHECK (is_admin(get_current_clerk_user_id()));

-- Group permissions policies
CREATE POLICY "Service role can manage group permissions"
  ON public.group_permissions FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view group permissions"
  ON public.group_permissions FOR SELECT
  USING (get_current_clerk_user_id() IS NOT NULL OR get_current_clerk_user_id() IS NULL);

CREATE POLICY "Admins can manage group permissions"
  ON public.group_permissions FOR ALL
  USING (is_admin(get_current_clerk_user_id()))
  WITH CHECK (is_admin(get_current_clerk_user_id()));

-- ============================================
-- 12. TRIGGERS
-- ============================================

-- Update timestamp triggers
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. MIGRATE EXISTING USERS
-- ============================================

-- Create user_roles entries for existing users based on their role field
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT 
  u.id,
  r.id,
  true
FROM public.users u
JOIN public.roles r ON r.name = u.role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = u.id AND ur.role_id = r.id
)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.roles IS 'User roles with hierarchy and permissions';
COMMENT ON TABLE public.permissions IS 'Granular permissions for resources and actions';
COMMENT ON TABLE public.role_permissions IS 'Many-to-many relationship between roles and permissions';
COMMENT ON TABLE public.groups IS 'User groups for organization and team management';
COMMENT ON TABLE public.group_permissions IS 'Many-to-many relationship between groups and permissions';
COMMENT ON TABLE public.user_groups IS 'Many-to-many relationship between users and groups';
COMMENT ON TABLE public.user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON FUNCTION user_has_permission IS 'Check if a user has a specific permission through roles or groups';
COMMENT ON FUNCTION get_user_permissions IS 'Get all effective permissions for a user';
COMMENT ON FUNCTION get_user_roles IS 'Get all roles assigned to a user';
COMMENT ON FUNCTION get_user_groups IS 'Get all groups a user belongs to';
