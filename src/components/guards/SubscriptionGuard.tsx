import type { ReactNode } from "react";
import useSubscriptionAccess from "../../hooks/useSubscriptionAccess";
import InactiveSubscriptionNotice from "../common/InactiveSubscriptionNotice";

type SubscriptionGuardProps = {
  children: ReactNode;
  allowWhenInactive?: boolean;
  title?: string;
  description?: string;
};

const SubscriptionGuard = ({
  children,
  allowWhenInactive = false,
  title,
  description,
}: SubscriptionGuardProps) => {
  const subscriptionAccess = useSubscriptionAccess();

  if (!subscriptionAccess.isActive && !allowWhenInactive) {
    return (
      <InactiveSubscriptionNotice
        title={title}
        description={description}
        reason={subscriptionAccess.reason}
      />
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
