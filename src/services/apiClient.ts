type AppLoadingController = {
  begin: (message?: string) => boolean;
  end: () => void;
  isBlocking: () => boolean;
};

let appLoadingController: AppLoadingController | null = null;

export const registerAppLoadingController = (controller: AppLoadingController | null) => {
  appLoadingController = controller;
};

export const beginMutationBlock = (message?: string): boolean => {
  if (!appLoadingController) {
    return true;
  }

  if (appLoadingController.isBlocking()) {
    return false;
  }

  return appLoadingController.begin(message);
};

export const endMutationBlock = () => {
  appLoadingController?.end();
};
