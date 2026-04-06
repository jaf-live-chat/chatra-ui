import React from "react";
import SubscriptionPlansView from "../../../sections/settings/SubscriptionPlansView";
import PageTitle from "../../../components/common/PageTitle";

const SubscriptionPlans = () => {
  return (
    <React.Fragment>
       <PageTitle
        title="Subscription Plans"
        description="Manage your subscription plan and billing information."
        canonical="/portal/subscription-plans"

      />
      <SubscriptionPlansView />
    </React.Fragment>
  );
};

export default SubscriptionPlans;