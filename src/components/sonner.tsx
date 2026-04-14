import { useTheme } from "@mui/material/styles";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import cn from "../utils/cn";

const Toaster = ({ closeButton = true, theme, ...props }: ToasterProps) => {
  const muiTheme = useTheme();
  const toastOptions: ToasterProps["toastOptions"] = {
    ...props.toastOptions,
    classNames: {
      ...props.toastOptions?.classNames,
      toast: cn("pr-14", props.toastOptions?.classNames?.toast),
      closeButton: cn(
        "!left-auto !right-2 !top-[68%] !-translate-y-1/2 !h-8 !w-8 !p-0 !inline-flex !items-center !justify-center [&>svg]:!h-4 [&>svg]:!w-4 [&>svg]:!m-0",
        props.toastOptions?.classNames?.closeButton,
      ),
    },
  };

  return (
    <Sonner
      closeButton={closeButton}
      theme={theme ?? (muiTheme.palette.mode === "dark" ? "dark" : "light")}
      toastOptions={toastOptions}
      {...props}
    />
  );
};

export { Toaster };
export { toast } from "sonner";

export default Toaster;

