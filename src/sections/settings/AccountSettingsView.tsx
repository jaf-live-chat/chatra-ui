import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
  Code,
  Copy,
} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import Agents from "../../services/agentServices";
import AvatarUpload from "../../components/uploads/AvatarUpload";
import { API_BASE_URL, USER_ROLES } from "../../constants/constants";
import PageTitle from "../../components/common/PageTitle";
import TitleTag from "../../components/TitleTag"
import { Box } from "@mui/material";

const ACCOUNT_SETTINGS_UNLOCK_MS = 10 * 60 * 1000;

const formatCountdown = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const splitFullName = (fullName: string) => {
  const name = String(fullName || "").trim();

  if (!name) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = name.split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
};

const formatRoleLabel = (role?: string) =>
  String(role || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "User";

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) {
      return data.message;
    }
  }

  return fallbackMessage;
};

const normalizePhilippinePhoneDigits = (value: string) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("63")) {
    return `0${digits.slice(2, 12)}`;
  }

  if (digits.startsWith("9")) {
    return `0${digits.slice(0, 10)}`;
  }

  if (digits.startsWith("0")) {
    return digits.slice(0, 11);
  }

  return digits.slice(0, 11);
};

const formatPhilippinePhone = (value: string) => {
  const normalized = normalizePhilippinePhoneDigits(value);

  if (!normalized) {
    return "";
  }

  const part1 = normalized.slice(0, 4);
  const part2 = normalized.slice(4, 7);
  const part3 = normalized.slice(7, 11);

  return [part1, part2, part3].filter(Boolean).join(" ");
};

const isValidPhilippinePhone = (value: string) => {
  const normalized = normalizePhilippinePhoneDigits(value);
  if (!normalized) {
    return true;
  }

  return /^09\d{9}$/.test(normalized);
};

const toPhilippineE164 = (value: string) => {
  const normalized = normalizePhilippinePhoneDigits(value);
  if (!/^09\d{9}$/.test(normalized)) {
    return null;
  }

  return `+63${normalized.slice(1)}`;
};

const AccountSettingsView = () => {
  const { user, tenant, accessToken, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [unlockUntil, setUnlockUntil] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleCopy = (text: string, id: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    timezone: "America/New_York",
    language: "English",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileFieldErrors, setProfileFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<string | null>(null);
  const [clearAvatarRequested, setClearAvatarRequested] = useState(false);
  const pendingAvatarPreviewUrlRef = React.useRef<string | null>(null);
  const hasPendingAvatarChangesRef = React.useRef(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewChat: true,
    emailMissedChat: true,
    emailWeeklyReport: false,
    pushNewMessage: true,
    pushAgentOffline: false,
    pushQueueAlert: true,
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    twoFactorEnabled: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const unlockStorageKey = accessToken
    ? `jaf_account_settings_unlock_until_${accessToken}`
    : null;

  useEffect(() => {
    if (!unlockStorageKey) {
      setUnlockUntil(null);
      return;
    }

    const storedUnlockUntil = Number(sessionStorage.getItem(unlockStorageKey) || "0");
    setUnlockUntil(storedUnlockUntil > Date.now() ? storedUnlockUntil : null);
  }, [unlockStorageKey]);

  useEffect(() => {
    if (!unlockUntil) {
      return;
    }

    const timer = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [unlockUntil]);

  useEffect(() => {
    if (!unlockUntil || !unlockStorageKey) {
      return;
    }

    if (Date.now() >= unlockUntil) {
      setUnlockUntil(null);
      sessionStorage.removeItem(unlockStorageKey);
    }
  }, [nowTs, unlockStorageKey, unlockUntil]);

  const handleUnlockPage = async () => {
    if (!unlockPassword.trim()) {
      setUnlockError("Please enter your password to continue.");
      return;
    }

    try {
      setIsUnlocking(true);
      setUnlockError("");

      await Agents.verifyPassword(unlockPassword);

      const nextUnlockUntil = Date.now() + ACCOUNT_SETTINGS_UNLOCK_MS;
      setUnlockUntil(nextUnlockUntil);

      if (unlockStorageKey) {
        sessionStorage.setItem(unlockStorageKey, String(nextUnlockUntil));
      }

      setUnlockPassword("");
      setShowUnlockPassword(false);
    } catch (error) {
      setUnlockError(getApiErrorMessage(error, "Password verification failed."));
    } finally {
      setIsUnlocking(false);
    }
  };

  useEffect(() => {
    hasPendingAvatarChangesRef.current = Boolean(
      pendingAvatarFile || pendingAvatarPreviewUrl || clearAvatarRequested
    );
  }, [pendingAvatarFile, pendingAvatarPreviewUrl, clearAvatarRequested]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const { firstName, lastName } = splitFullName(user.fullName || "");

    setProfile((prev) => ({
      ...prev,
      firstName,
      lastName,
      email: user.emailAddress || "",
      phone: formatPhilippinePhone(user.phoneNumber || ""),
      role: formatRoleLabel(user.role),
    }));
    if (!hasPendingAvatarChangesRef.current) {
      setAvatarUrl(user.profilePicture || null);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsProfileLoading(true);
        const me = await Agents.getMe();

        if (!isMounted) {
          return;
        }

        const { firstName, lastName } = splitFullName(me.agent?.fullName || "");

        setProfile((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: me.agent?.emailAddress || "",
          phone: formatPhilippinePhone(me.agent?.phoneNumber || ""),
          role: formatRoleLabel(me.agent?.role),
        }));
        if (!hasPendingAvatarChangesRef.current) {
          setAvatarUrl(me.agent?.profilePicture || null);
        }
        setProfileError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProfileError(getApiErrorMessage(error, "Failed to load account profile."));
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    pendingAvatarPreviewUrlRef.current = pendingAvatarPreviewUrl;
  }, [pendingAvatarPreviewUrl]);

  useEffect(() => {
    return () => {
      if (pendingAvatarPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingAvatarPreviewUrlRef.current);
      }
    };
  }, []);

  const canViewTenantApiKey = [
    USER_ROLES.MASTER_ADMIN.value,
    USER_ROLES.ADMIN.value,
  ].includes(user?.role || "");

  // Reset to profile tab if user loses access to integration
  useEffect(() => {
    if (activeSection === "integration" && !canViewTenantApiKey) {
      setActiveSection("profile");
    }
  }, [canViewTenantApiKey, activeSection]);

  const handleProfileSave = async () => {
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const trimmedFirstName = profile.firstName.trim();
    const trimmedLastName = profile.lastName.trim();
    const trimmedEmail = profile.email.trim();

    const nextFieldErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    };

    if (!trimmedFirstName) {
      nextFieldErrors.firstName = "First name is required.";
    }

    if (!trimmedLastName) {
      nextFieldErrors.lastName = "Last name is required.";
    }

    if (!trimmedEmail) {
      nextFieldErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!isValidPhilippinePhone(profile.phone)) {
      nextFieldErrors.phone = "Use a valid PH mobile number (e.g. 0917 123 4567).";
    }

    setProfileFieldErrors(nextFieldErrors);

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setProfileError("Please fix the highlighted fields.");
      return;
    }

    const phoneForApi = profile.phone.trim() ? toPhilippineE164(profile.phone) : null;

    try {
      setIsProfileSaving(true);
      setProfileError("");

      let response;

      if (pendingAvatarFile) {
        const formData = new FormData();
        formData.append("avatar", pendingAvatarFile);
        formData.append("fullName", fullName);
        formData.append("emailAddress", trimmedEmail);
        if (phoneForApi) {
          formData.append("phoneNumber", phoneForApi);
        }
        response = await Agents.updateMyProfile(formData);
      } else {
        response = await Agents.updateMyProfile({
          fullName,
          emailAddress: trimmedEmail,
          phoneNumber: phoneForApi,
          profilePicture: clearAvatarRequested ? null : undefined,
        });
      }

      if (response?.agent) {
        updateUser(response.agent);
        setAvatarUrl(response.agent.profilePicture || null);
        setPendingAvatarFile(null);
        setPendingAvatarPreviewUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return null;
        });
        setClearAvatarRequested(false);
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error) {
      setProfileError(getApiErrorMessage(error, "Failed to save profile changes."));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleAvatarSelected = (file: File, previewUrl: string) => {
    setPendingAvatarFile(file);
    setPendingAvatarPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return previewUrl;
    });
    setClearAvatarRequested(false);
    setProfileError("");
  };

  const handleAvatarClear = () => {
    setPendingAvatarFile(null);
    setPendingAvatarPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setClearAvatarRequested(true);
    setProfileError("");
  };

  const handleSecuritySave = async () => {
    const currentPassword = security.currentPassword.trim();
    const newPassword = security.newPassword.trim();

    if (!currentPassword || !newPassword) {
      setSecurityError("Current and new password are required.");
      return;
    }

    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters.");
      return;
    }

    try {
      setIsSecuritySaving(true);
      setSecurityError("");

      const response = await Agents.updateMyProfile({
        password: newPassword,
      });

      if (response?.agent) {
        updateUser(response.agent);
      }

      setSecurity((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
      setSecuritySaved(true);
      setTimeout(() => setSecuritySaved(false), 2000);
    } catch (error) {
      setSecurityError(getApiErrorMessage(error, "Failed to update password."));
    } finally {
      setIsSecuritySaving(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    ...(canViewTenantApiKey ? [{ id: "integration", label: "Integration", icon: Code }] : []),
  ];

  const isUnlocked = Boolean(unlockUntil && unlockUntil > nowTs);
  const remainingUnlockMs = isUnlocked ? (unlockUntil || 0) - nowTs : 0;

  const tenantApiKey = canViewTenantApiKey ? tenant?.apiKey || "" : "";
  const socketUrl = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");
  const widgetScript = `<!-- Live Chat Widget -->\n<script>\n  window.LiveChatConfig = {\n    apiUrl: '${API_BASE_URL}',\n    socketUrl: '${socketUrl}',\n    apiKey: '${tenantApiKey || ""}'\n  };\n</script>\n<script src="https://timora-live-chat.vercel.app/widget/live-chat-widget.js"></script>`;

  return (
    <React.Fragment>
      <PageTitle
        title="Account Settings"
        description="Manage your profile, notifications, and security preferences."
        canonical="/portal/account-settings"
      />
      <div>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <TitleTag
            title="Account Settings"
            subtitle="Manage your profile, notifications, and security preferences."
            icon={<User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
          />
        </Box>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${activeSection === section.id
                      ? "bg-cyan-50 text-cyan-700 border-l-[3px] border-cyan-600"
                      : "text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent"
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                {/* Avatar Area */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-5">
                  <AvatarUpload
                    imageUrl={clearAvatarRequested ? null : pendingAvatarPreviewUrl || avatarUrl}
                    fullName={`${profile.firstName} ${profile.lastName}`}
                    onFileSelected={handleAvatarSelected}
                    onClear={handleAvatarClear}
                    onError={(message) => setProfileError(message)}
                    disabled={isProfileLoading || isProfileSaving}
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <span
                      className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "#0891B21A",
                        color: "#0891b2",
                      }}
                    >
                      {profile.role}
                    </span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-5">
                  {profileError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {profileError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) =>
                          setProfile({ ...profile, firstName: e.target.value })
                        }
                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors ${profileFieldErrors.firstName
                          ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                          : "border-gray-200 focus:ring-cyan-100 focus:border-cyan-400"
                          }`}
                        placeholder="First name"
                        disabled={isProfileLoading}
                      />
                      {profileFieldErrors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{profileFieldErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) =>
                          setProfile({ ...profile, lastName: e.target.value })
                        }
                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors ${profileFieldErrors.lastName
                          ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                          : "border-gray-200 focus:ring-cyan-100 focus:border-cyan-400"
                          }`}
                        placeholder="Last name"
                        disabled={isProfileLoading}
                      />
                      {profileFieldErrors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{profileFieldErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className={`w-full pl-10 pr-3.5 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors ${profileFieldErrors.email
                          ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                          : "border-gray-200 focus:ring-cyan-100 focus:border-cyan-400"
                          }`}
                        placeholder="name@example.com"
                        disabled={isProfileLoading}
                      />
                    </div>
                    {profileFieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{profileFieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: formatPhilippinePhone(e.target.value) })
                      }
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors ${profileFieldErrors.phone
                        ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                        : "border-gray-200 focus:ring-cyan-100 focus:border-cyan-400"
                        }`}
                      placeholder="0917 123 4567"
                      disabled={isProfileLoading}
                    />
                    {profileFieldErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{profileFieldErrors.phone}</p>
                    )}
                  </div>

                </div>

                {/* Save Button */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleProfileSave}
                    disabled={isProfileLoading || isProfileSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {isProfileSaving ? (
                      <>
                        <Save className="w-4 h-4" /> Saving...
                      </>
                    ) : profileSaved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose how and when you want to be notified.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" /> Email
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: "emailNewChat" as const,
                          label: "New chat started",
                          desc: "Get notified when a visitor starts a new chat",
                        },
                        {
                          key: "emailMissedChat" as const,
                          label: "Missed chats",
                          desc: "Alert when a chat goes unanswered",
                        },
                        {
                          key: "emailWeeklyReport" as const,
                          label: "Weekly report",
                          desc: "Summary of chat activity every Monday",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() =>
                              setNotifications({
                                ...notifications,
                                [item.key]: !notifications[item.key],
                              })
                            }
                            className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${notifications[item.key]
                              ? "bg-green-500"
                              : "bg-gray-300"
                              }`}
                          >
                            <span
                              className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications[item.key]
                                ? "translate-x-[18px]"
                                : "translate-x-0"
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-400" /> Push
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: "pushNewMessage" as const,
                          label: "New messages",
                          desc: "Browser push for incoming messages",
                        },
                        {
                          key: "pushAgentOffline" as const,
                          label: "Agent goes offline",
                          desc: "Alert when a team member disconnects",
                        },
                        {
                          key: "pushQueueAlert" as const,
                          label: "Queue overload",
                          desc: "Notify when queue exceeds 10 visitors",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() =>
                              setNotifications({
                                ...notifications,
                                [item.key]: !notifications[item.key],
                              })
                            }
                            className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${notifications[item.key]
                              ? "bg-green-500"
                              : "bg-gray-300"
                              }`}
                          >
                            <span
                              className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications[item.key]
                                ? "translate-x-[18px]"
                                : "translate-x-0"
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Security
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your password and manage two-factor authentication.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {securityError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {securityError}
                    </div>
                  )}

                  {/* Change Password */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" /> Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={security.currentPassword}
                            onChange={(e) =>
                              setSecurity({
                                ...security,
                                currentPassword: e.target.value,
                              })
                            }
                            placeholder="Enter current password"
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors pr-10"
                          />
                          <button
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={security.newPassword}
                            onChange={(e) =>
                              setSecurity({
                                ...security,
                                newPassword: e.target.value,
                              })
                            }
                            placeholder="Enter new password"
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors pr-10"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                          Must be at least 8 characters with a number and special
                          character.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSecuritySave}
                    disabled={isSecuritySaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {isSecuritySaving ? (
                      <>
                        <Save className="w-4 h-4" /> Updating...
                      </>
                    ) : securitySaved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Update Security
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Integration Section */}
            {activeSection === "integration" && canViewTenantApiKey && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Integration
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Your API key and live chat widget installation code.
                      </p>
                    </div>
                  </div>
                </div>

                {!isUnlocked ? (
                  <div className="p-6">
                    <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900">Verify To Continue</h2>
                      <p className="text-sm text-gray-600 mt-2">
                        For security, enter your current password to access Integration settings. Access expires after 10 minutes.
                      </p>

                      <div className="mt-4 relative">
                        <input
                          type={showUnlockPassword ? "text" : "password"}
                          value={unlockPassword}
                          onChange={(event) => {
                            setUnlockPassword(event.target.value);
                            setUnlockError("");
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleUnlockPage();
                            }
                          }}
                          placeholder="Enter your password"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 pr-10"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowUnlockPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showUnlockPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {unlockError && <p className="mt-2 text-xs text-red-600">{unlockError}</p>}

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleUnlockPage}
                          disabled={isUnlocking}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold disabled:opacity-70"
                        >
                          {isUnlocking ? "Verifying..." : "Verify Password"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    <p className="text-xs text-cyan-700">
                      Verified session expires in {formatCountdown(remainingUnlockMs)}. You will be asked for your password again when it expires.
                    </p>

                    {/* API Key */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" /> API Key
                      </h3>
                      {!canViewTenantApiKey ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          API key access is available only for Admin and Master Admin accounts.
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <code className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono select-all break-all">
                            {tenantApiKey || "No API key available"}
                          </code>
                          <button
                            onClick={() => handleCopy(tenantApiKey || "", "apiKey")}
                            disabled={!tenantApiKey}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {copied === "apiKey" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied === "apiKey" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Widget Script */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-gray-400" /> Widget Installation
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        Paste this snippet before the closing <code className="text-cyan-600">&lt;/body&gt;</code> tag of your website.
                      </p>
                      <div className="relative">
                        <pre className="px-4 py-3.5 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                          {widgetScript}
                        </pre>
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleCopy(widgetScript, "widget")}
                          className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-xs font-medium transition-colors cursor-pointer"
                        >
                          {copied === "widget" ? (
                            <span className="flex items-center gap-1.5 text-green-400">
                              <Check className="w-3.5 h-3.5" /> Copied!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Copy className="w-3.5 h-3.5" /> Copy
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


      </div>

    </React.Fragment>);
}

export default AccountSettingsView;
