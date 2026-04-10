import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Save,
  Upload,
  Pencil,
  Check,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useDarkMode } from "../../providers/DarkModeContext";
import TitleTag from "../../components/TitleTag";
import { toast } from "sonner";
import type {
  CompanyBrandLogoMap,
  CompanyInfoFormData,
  CompanyInfoRecord,
  UpdateCompanyInfoPayload,
} from "../../models/CompanyInfoModel";
import companyInfoServices, { useGetCompanyInfo } from "../../services/companyInfoServices";

type LogoType = "light" | "dark" | "collapsed";

const LOGO_COPY: Record<LogoType, { title: string; description: string }> = {
  dark: {
    title: "Light Mode Logo",
    description: "Used on light backgrounds and bright surfaces.",
  },
  light: {
    title: "Dark Mode Logo",
    description: "Used on dark backgrounds and dark headers.",
  },
  collapsed: {
    title: "Collapsed Drawer Logo",
    description: "Used in the compact sidebar / minimized navigation state.",
  },
};

const EMPTY_INFO: CompanyInfoFormData = {
  name: "",
  website: "",
  email: "",
  phone: "",
  logoUrl: "",
};

const getLogoUrl = (companyInfo?: CompanyInfoRecord, logoType?: LogoType) => {
  if (!companyInfo) {
    return "";
  }

  if (logoType === "light") {
    return companyInfo.brandLogos?.light?.url || companyInfo.companyLogo?.url || "";
  }

  if (logoType === "dark") {
    return companyInfo.brandLogos?.dark?.url || companyInfo.companyLogo?.url || "";
  }

  return companyInfo.brandLogos?.collapsed?.url || companyInfo.companyLogo?.url || "";
};

const mapApiToForm = (companyInfo?: CompanyInfoRecord): CompanyInfoFormData => {
  if (!companyInfo) {
    return EMPTY_INFO;
  }

  return {
    name: companyInfo.generalInformation?.companyName || "",
    website: companyInfo.generalInformation?.website || "",
    email: companyInfo.generalInformation?.contactEmail || "",
    phone: companyInfo.generalInformation?.phoneNumber || "",
    logoUrl: getLogoUrl(companyInfo, "collapsed"),
  };
};

function LogoUploadCard({
  logoType,
  previewUrl,
  pendingFileName,
  editing,
  isDark,
  onPickFile,
}: {
  logoType: LogoType;
  previewUrl: string;
  pendingFileName?: string;
  editing: boolean;
  isDark: boolean;
  onPickFile: (logoType: LogoType, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleTriggerUpload = () => {
    if (!editing) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    onPickFile(logoType, file);
  };

  const title = LOGO_COPY[logoType].title;
  const description = LOGO_COPY[logoType].description;

  return (
    <div
      className={`rounded-lg sm:rounded-xl border p-3 sm:p-4 ${isDark ? "border-slate-700 bg-slate-900/40" : "border-gray-200 bg-gray-50"}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-inner overflow-hidden shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            title
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm sm:text-base font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
            {title}
          </p>
          <p className={`text-xs sm:text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            {description}
          </p>
          <p className={`text-xs mt-2 sm:mt-3 ${isDark ? "text-slate-500" : "text-gray-400"}`}>
            Recommended: PNG or JPG, square aspect ratio.
          </p>

          {editing && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={handleTriggerUpload}
                className={`inline-flex items-center gap-1.5 mt-3 sm:mt-4 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isDark
                    ? "text-cyan-400 bg-cyan-900/30 border-cyan-700 hover:bg-cyan-900/50"
                    : "text-cyan-700 bg-cyan-50 border-cyan-200 hover:bg-cyan-100"
                  }`}
              >
                <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                {pendingFileName ? `Change ${title}` : `Upload ${title}`}
              </button>
              {pendingFileName && (
                <p className={`mt-2 text-xs ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                  Pending file: {pendingFileName}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const mapFormToUpdatePayload = (formData: CompanyInfoFormData): UpdateCompanyInfoPayload => ({
  generalInformation: {
    companyName: formData.name,
    website: formData.website,
    contactEmail: formData.email,
    phoneNumber: formData.phone,
  },
});

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
    if (maybeError.response?.data?.message) {
      return maybeError.response.data.message;
    }

    if (maybeError.message) {
      return maybeError.message;
    }
  }

  return fallbackMessage;
};

function FieldRow({
  icon,
  label,
  value,
  name,
  editing,
  onChange,
  type = "text",
  placeholder,
  isDark,
  disabled = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  name: string;
  editing: boolean;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  isDark: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2 sm:gap-4 py-3 sm:py-4 border-b last:border-0 ${isDark ? "border-slate-700" : "border-gray-100"
        }`}
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isDark ? "bg-cyan-900/40" : "bg-cyan-50"
          }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-xs mb-1 sm:mb-1.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{label}</p>
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            disabled={disabled}
            placeholder={placeholder || label}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${isDark
                ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400"
                : "border-gray-200 bg-white text-gray-900"
              }`}
          />
        ) : (
          <p className={`text-sm truncate ${isDark ? "text-slate-200" : "text-gray-900"}`}>
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

const CompanyInfoView = () => {
  const { isDark } = useDarkMode();
  const { companyInfo, isLoading, error, mutate } = useGetCompanyInfo();

  const [info, setInfo] = useState<CompanyInfoFormData>(EMPTY_INFO);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CompanyInfoFormData>(EMPTY_INFO);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingLogoFiles, setPendingLogoFiles] = useState<Record<LogoType, File | null>>({
    light: null,
    dark: null,
    collapsed: null,
  });
  const [pendingLogoPreviews, setPendingLogoPreviews] = useState<Record<LogoType, string>>({
    light: "",
    dark: "",
    collapsed: "",
  });

  useEffect(() => {
    if (!companyInfo) {
      return;
    }

    const mapped = mapApiToForm(companyInfo);
    setInfo(mapped);

    if (!editing) {
      setDraft(mapped);
    }
  }, [companyInfo, editing]);

  const isBusy = isSaving;

  const handleChange = (name: string, value: string) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await companyInfoServices.updateCompanyInfo(mapFormToUpdatePayload(draft));
      let latestCompanyInfo = response.companyInfo;

      const logoUploadOrder: LogoType[] = ["light", "dark", "collapsed"];
      for (const logoType of logoUploadOrder) {
        const pendingFile = pendingLogoFiles[logoType];

        if (!pendingFile) {
          continue;
        }

        const logoResponse = await companyInfoServices.updateCompanyLogo(pendingFile, logoType);
        latestCompanyInfo = logoResponse.companyInfo;
      }

      const mapped = mapApiToForm(latestCompanyInfo);

      setInfo(mapped);
      setDraft(mapped);
      setPendingLogoFiles({ light: null, dark: null, collapsed: null });
      setPendingLogoPreviews({ light: "", dark: "", collapsed: "" });
      setEditing(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);

      toast.success(response.message || "Company information saved successfully.");
      await mutate();
    } catch (updateError) {
      toast.error(getErrorMessage(updateError, "Failed to save company information."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(info);
    setPendingLogoFiles({ light: null, dark: null, collapsed: null });
    setPendingLogoPreviews({ light: "", dark: "", collapsed: "" });
    setEditing(false);
  };

  const handleEdit = () => {
    setDraft(info);
    setEditing(true);
  };

  const handleRetryLoad = async () => {
    try {
      await mutate();
    } catch {
      toast.error("Unable to refresh company information.");
    }
  };

  const handleLogoPick = (logoType: LogoType, file: File) => {
    const previewUrl = URL.createObjectURL(file);

    setPendingLogoFiles((prev) => ({ ...prev, [logoType]: file }));
    setPendingLogoPreviews((prev) => {
      if (prev[logoType]) {
        URL.revokeObjectURL(prev[logoType]);
      }

      return {
        ...prev,
        [logoType]: previewUrl,
      };
    });
  };

  useEffect(() => {
    return () => {
      Object.values(pendingLogoPreviews).forEach((previewUrl) => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      });
    };
  }, [pendingLogoPreviews]);

  const current = editing ? draft : info;

  const cardClass = isDark
    ? "bg-slate-800 rounded-lg sm:rounded-xl border border-slate-700 shadow-sm p-4 sm:p-6 md:p-8 mx-4 sm:mx-6 md:mx-8 mb-6 sm:mb-8 md:mb-10"
    : "bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 mx-4 sm:mx-6 md:mx-8 mb-6 sm:mb-8 md:mb-10";

  const sectionTitleClass = isDark
    ? "text-sm sm:text-base font-semibold text-slate-300 mb-3 sm:mb-4"
    : "text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4";

  const sectionTitleClassSm = isDark
    ? "text-sm font-semibold text-slate-300 mb-2 sm:mb-3"
    : "text-sm font-semibold text-gray-700 mb-2 sm:mb-3";

  if (isLoading && !companyInfo) {
    return (
      <div className={`min-h-full rounded-lg sm:rounded-xl border p-4 sm:p-6 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
          <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>
            Loading company information...
          </p>
        </div>
      </div>
    );
  }

  if (error && !companyInfo) {
    return (
      <div className={`min-h-full rounded-lg sm:rounded-xl border p-4 sm:p-6 ${isDark ? "border-red-700/60 bg-red-900/20" : "border-red-200 bg-red-50"}`}>
        <p className={`text-sm font-medium mb-3 ${isDark ? "text-red-300" : "text-red-700"}`}>
          Failed to load company information.
        </p>
        <button
          onClick={handleRetryLoad}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isDark ? "bg-slate-700 text-slate-100 hover:bg-slate-600" : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"}`}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const logoPreviews: CompanyBrandLogoMap = {
    light: {
      url: pendingLogoPreviews.light || getLogoUrl(companyInfo, "light"),
      publicId: companyInfo?.brandLogos?.light?.publicId || companyInfo?.companyLogo?.publicId || "",
    },
    dark: {
      url: pendingLogoPreviews.dark || getLogoUrl(companyInfo, "dark"),
      publicId: companyInfo?.brandLogos?.dark?.publicId || companyInfo?.companyLogo?.publicId || "",
    },
    collapsed: {
      url: pendingLogoPreviews.collapsed || getLogoUrl(companyInfo, "collapsed"),
      publicId: companyInfo?.brandLogos?.collapsed?.publicId || companyInfo?.companyLogo?.publicId || "",
    },
  };

  return (
    <div className={`min-h-full pb-28 sm:pb-24 ${isDark ? "bg-slate-900" : ""}`}>
      {/* Header */}
      <div className={`-mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8 border-b ${isDark ? "border-slate-700" : "border-gray-200"}`}>
        <div className="flex items-center justify-between gap-4">
          <TitleTag
            title="Company Information"
            subtitle="Manage your organization's profile and public details."
            icon={<Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          />
        </div>
      </div>

      {/* Floating Action Dock */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <div className={`flex items-center gap-2 rounded-xl border p-2 shadow-xl backdrop-blur ${isDark ? "bg-slate-900/90 border-slate-700" : "bg-white/90 border-gray-200"}`}>
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isBusy}
                className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                    ? "text-slate-300 bg-slate-700 hover:bg-slate-600 active:scale-95"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95"
                  }`}
              >
                <X className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-sm active:scale-95"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : <Save className="w-4 h-4 flex-shrink-0" />}
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              disabled={isBusy || isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-sm active:scale-95"
            >
              <Pencil className="w-4 h-4 flex-shrink-0" />
              <span>Edit Info</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved toast */}
      {saved && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${isDark
              ? "bg-green-900/40 border border-green-700 text-green-400"
              : "bg-green-50 border border-green-200 text-green-700"
            }`}
        >
          <Check className="w-4 h-4" />
          Company information saved successfully.
        </div>
      )}

      {error && companyInfo && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${isDark
              ? "bg-yellow-900/30 border border-yellow-700 text-yellow-300"
              : "bg-yellow-50 border border-yellow-200 text-yellow-800"
            }`}
        >
          <RefreshCw className="w-4 h-4" />
          Some data may be stale. Refresh the page if values look outdated.
        </div>
      )}

      {/* Logo section */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Company Logo</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LogoUploadCard
            logoType="light"
            previewUrl={logoPreviews.light.url}
            pendingFileName={pendingLogoFiles.light?.name}
            editing={editing}
            isDark={isDark}
            onPickFile={handleLogoPick}
          />
          <LogoUploadCard
            logoType="dark"
            previewUrl={logoPreviews.dark.url}
            pendingFileName={pendingLogoFiles.dark?.name}
            editing={editing}
            isDark={isDark}
            onPickFile={handleLogoPick}
          />
          <LogoUploadCard
            logoType="collapsed"
            previewUrl={logoPreviews.collapsed.url}
            pendingFileName={pendingLogoFiles.collapsed?.name}
            editing={editing}
            isDark={isDark}
            onPickFile={handleLogoPick}
          />
        </div>
      </div>

      {/* General Info */}
      <div className={cardClass}>
        <h2 className={sectionTitleClassSm}>General Information</h2>
        <FieldRow
          icon={<Building2 className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Company Name"
          value={current.name}
          name="name"
          editing={editing}
          onChange={handleChange}
          disabled={isBusy}
          isDark={isDark}
        />
        <FieldRow
          icon={<Globe className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Website"
          value={current.website}
          name="website"
          editing={editing}
          onChange={handleChange}
          type="url"
          placeholder="https://example.com"
          disabled={isBusy}
          isDark={isDark}
        />
        <FieldRow
          icon={<Mail className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Contact Email"
          value={current.email}
          name="email"
          editing={editing}
          onChange={handleChange}
          type="email"
          disabled={isBusy}
          isDark={isDark}
        />
        <FieldRow
          icon={<Phone className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Phone Number"
          value={current.phone}
          name="phone"
          editing={editing}
          onChange={handleChange}
          type="tel"
          disabled={isBusy}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default CompanyInfoView;


