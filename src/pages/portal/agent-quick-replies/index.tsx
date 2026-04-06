import React from "react";
import QuickRepliesView from "../../../sections/settings/QuickRepliesView";
import PageTitle from "../../../components/common/PageTitle";

const AgentQuickRepliesPage = () => {
  return(
    <React.Fragment>
       <PageTitle
        title="Agent Quick Replies"
        description="Manage quick replies for agent use."
        canonical="/portal/agent-quick-replies"

      />
      <QuickRepliesView />
    </React.Fragment>
  );
};

export default AgentQuickRepliesPage;
