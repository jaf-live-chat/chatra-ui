import { USER_ROLES } from '../../../constants/constants';
import AuthGuard from '../../../components/guards/AuthGuard';
import TenantsTable from '../../../sections/tenants/TenantsTable';
import React from 'react';
import PageTitle from '../../../components/common/PageTitle';

const Tenants = () => {
  return (
    <React.Fragment>
       <PageTitle
        title="Tenants Management"
        description="Manage your tenants, their details, and subscription plans all in one place."
        canonical="/portal/tenants"
      />
    <AuthGuard allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}>
      <TenantsTable />
    </AuthGuard>
    </React.Fragment>
  );
};

export default Tenants