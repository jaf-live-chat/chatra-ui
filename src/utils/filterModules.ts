type RoleAware = {
  allowedRoles: string[];
};

const filterModulesByRole = <T extends RoleAware>(modules: T[], userRole?: string | null): T[] => {
  if (!userRole) {
    return [];
  }

  return modules.filter((module) => module.allowedRoles.includes(userRole));
};

export default filterModulesByRole;
