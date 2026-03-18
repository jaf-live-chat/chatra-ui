import { useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useDarkMode } from "./DarkModeContext";

interface CompanyInfo {
  name: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  industry: string;
  size: string;
  description: string;
  timezone: string;
  logoUrl: string;
}

const DEFAULT_INFO: CompanyInfo = {
  name: "JAF Chatra Inc.",
  website: "https://jafchatra.com",
  email: "admin@jafchatra.com",
  phone: "+1 (555) 012-3456",
  address: "123 Innovation Drive, Suite 400",
  city: "San Francisco",
  state: "CA",
  zip: "94105",
  country: "United States",
  industry: "SaaS / Customer Support",
  size: "51-200 employees",
  description:
    "JAF Chatra provides real-time live chat solutions for modern businesses, helping teams connect with customers instantly and boost satisfaction.",
  timezone: "America/Los_Angeles (PST)",
  logoUrl: "",
};

const STORAGE_KEY = "jaf_company_info";

function loadCompanyInfo(): CompanyInfo {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_INFO, ...JSON.parse(stored) };
  } catch {
    // fall through
  }
  return DEFAULT_INFO;
}

function saveCompanyInfo(info: CompanyInfo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  name: string;
  editing: boolean;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 py-4 border-b last:border-0 ${
        isDark ? "border-slate-700" : "border-gray-100"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          isDark ? "bg-cyan-900/40" : "bg-cyan-50"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{label}</p>
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder || label}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
              isDark
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

export function CompanyInfoView() {
  const { isDark } = useDarkMode();
  const [info, setInfo] = useState<CompanyInfo>(loadCompanyInfo);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CompanyInfo>(info);
  const [saved, setSaved] = useState(false);

  const handleChange = (name: string, value: string) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setInfo(draft);
    saveCompanyInfo(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setDraft(info);
    setEditing(false);
  };

  const handleEdit = () => {
    setDraft(info);
    setEditing(true);
  };

  const current = editing ? draft : info;

  const cardClass = isDark
    ? "bg-slate-800 rounded-xl border border-slate-700 shadow-sm p-6 mb-6"
    : "bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6";

  const sectionTitleClass = isDark
    ? "text-sm font-semibold text-slate-300 mb-4"
    : "text-sm font-semibold text-gray-700 mb-4";

  const sectionTitleClassSm = isDark
    ? "text-sm font-semibold text-slate-300 mb-2"
    : "text-sm font-semibold text-gray-700 mb-2";

  return (
    <div
      className={`min-h-full ${isDark ? "bg-slate-900" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className={`text-2xl font-bold flex items-center gap-2 ${
              isDark ? "text-slate-100" : "text-gray-900"
            }`}
          >
            <Building2 className="w-6 h-6 text-cyan-500" />
            Company Information
          </h1>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Manage your organization's profile and public details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? "text-slate-300 bg-slate-700 hover:bg-slate-600"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit Info
            </button>
          )}
        </div>
      </div>

      {/* Saved toast */}
      {saved && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
            isDark
              ? "bg-green-900/40 border border-green-700 text-green-400"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          <Check className="w-4 h-4" />
          Company information saved successfully.
        </div>
      )}

      {/* Logo section */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Company Logo</h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
            {current.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <p className={`text-sm mb-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
              Upload a square logo (at least 200x200px). PNG or JPG.
            </p>
            {editing && (
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isDark
                    ? "text-cyan-400 bg-cyan-900/30 border-cyan-700 hover:bg-cyan-900/50"
                    : "text-cyan-700 bg-cyan-50 border-cyan-200 hover:bg-cyan-100"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </button>
            )}
          </div>
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
          isDark={isDark}
        />
      </div>

      {/* Address */}
      <div className={cardClass}>
        <h2 className={sectionTitleClassSm}>Address</h2>
        <FieldRow
          icon={<MapPin className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Street Address"
          value={current.address}
          name="address"
          editing={editing}
          onChange={handleChange}
          isDark={isDark}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-6">
          <FieldRow
            icon={<MapPin className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
            label="City"
            value={current.city}
            name="city"
            editing={editing}
            onChange={handleChange}
            isDark={isDark}
          />
          <FieldRow
            icon={<MapPin className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
            label="State / Province"
            value={current.state}
            name="state"
            editing={editing}
            onChange={handleChange}
            isDark={isDark}
          />
          <FieldRow
            icon={<MapPin className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
            label="ZIP / Postal Code"
            value={current.zip}
            name="zip"
            editing={editing}
            onChange={handleChange}
            isDark={isDark}
          />
        </div>
        <FieldRow
          icon={<Globe className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Country"
          value={current.country}
          name="country"
          editing={editing}
          onChange={handleChange}
          isDark={isDark}
        />
      </div>

      {/* Business Details */}
      <div className={cardClass}>
        <h2 className={sectionTitleClassSm}>Business Details</h2>
        <FieldRow
          icon={<Building2 className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Industry"
          value={current.industry}
          name="industry"
          editing={editing}
          onChange={handleChange}
          isDark={isDark}
        />
        <FieldRow
          icon={<Building2 className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Company Size"
          value={current.size}
          name="size"
          editing={editing}
          onChange={handleChange}
          isDark={isDark}
        />
        <FieldRow
          icon={<Globe className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />}
          label="Timezone"
          value={current.timezone}
          name="timezone"
          editing={editing}
          onChange={handleChange}
          isDark={isDark}
        />
        <div
          className={`flex items-start gap-4 py-4 ${
            isDark ? "border-t border-slate-700" : "border-t border-gray-100"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isDark ? "bg-cyan-900/40" : "bg-cyan-50"
            }`}
          >
            <Building2 className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
              Description
            </p>
            {editing ? (
              <textarea
                value={current.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none ${
                  isDark
                    ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              />
            ) : (
              <p className={`text-sm ${isDark ? "text-slate-200" : "text-gray-900"}`}>
                {current.description || "—"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}