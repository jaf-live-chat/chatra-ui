import { USER_ROLES } from '../../../constants/constants';
import AuthGuard from '../../../components/guards/AuthGuard';
import TenantsTable from '../../../sections/tenants/TenantsTable';

const Tenants = () => {
  return (
    <AuthGuard allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}>
      <TenantsTable />
    </AuthGuard>
  );
};

export default Tenants