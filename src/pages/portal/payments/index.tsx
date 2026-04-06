import React from 'react'
import PaymentsTable from '../../../sections/payments/PaymentsTable'
import PageTitle from '../../../components/common/PageTitle'

const Payments: React.FC = () => {
  return (
    <React.Fragment>
       <PageTitle
        title="Payments Management"
        description="Manage payment methods, billing information, and transaction history."
        canonical="/portal/payments "

      />
      <PaymentsTable />
    </React.Fragment>
  )
}

export default Payments