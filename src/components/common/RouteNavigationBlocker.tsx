import { useEffect } from "react";
import { useBlocker } from "react-router";
import { useAppLoading } from "../../providers/AppLoadingProvider";

export default function RouteNavigationBlocker() {
  const { isBlocking } = useAppLoading();

  const blocker = useBlocker(() => isBlocking);

  useEffect(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }, [blocker]);

  return null;
}
