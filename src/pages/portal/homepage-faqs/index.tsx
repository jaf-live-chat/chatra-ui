import React from "react";
import FaqEditorView from "../../../sections/settings/FaqEditorView";
import PageTitle from "../../../components/common/PageTitle";

const HomepageFAQs = () => {
  return(
    <React.Fragment>
       <PageTitle
        title="Homepage FAQs"
        description="Manage frequently asked questions for the homepage."
        canonical="/portal/homepage-faqs"

      />
      <FaqEditorView />
    </React.Fragment>
  );
};

export default HomepageFAQs;