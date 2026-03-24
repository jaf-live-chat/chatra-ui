import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import ImageWithFallback from "../../components/ImageWithFallback";

const AgentSettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "Support",
    lastName: "Agent",
    email: "agent@jaflivechat.com",
    phone: "+1 (555) 987-6543",
    role: "Agent",
    timezone: "America/Los_Angeles",
    language: "English",
  });

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

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Manage your profile, notifications, and security preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-row md:flex-col">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 text-sm font-medium transition-colors text-center md:text-left ${activeSection === section.id
                      ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 md:border-l-[3px] border-b-[3px] md:border-b-0 border-cyan-600"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 md:border-l-[3px] border-b-[3px] md:border-b-0 border-transparent"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              {/* Avatar Area */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative group">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMGFnZW50fGVufDF8fHx8MTc3MzYyNzk0MXww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
                  />
                  <button className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{profile.email}</p>
                  <span
                    className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
                  >
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
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
                      className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      Language
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) =>
                        setProfile({ ...profile, language: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
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
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Choose how and when you want to be notified.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> Email Notifications
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
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key],
                            })
                          }
                          className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${notifications[item.key]
                              ? "bg-cyan-500"
                              : "bg-gray-300 dark:bg-slate-600"
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

                <div className="h-px bg-gray-100 dark:bg-slate-700" />

                {/* Push Notifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" /> Push Notifications
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
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key],
                            })
                          }
                          className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${notifications[item.key]
                              ? "bg-cyan-500"
                              : "bg-gray-300 dark:bg-slate-600"
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
              <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
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
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Update your password and manage two-factor authentication.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" /> Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
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
                          className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors pr-10"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
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
                          className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors pr-10"
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

                <div className="h-px bg-gray-100 dark:bg-slate-700" />

                {/* Two-Factor */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Two-Factor
                    Authentication
                  </h3>
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSecurity({
                          ...security,
                          twoFactorEnabled: !security.twoFactorEnabled,
                        })
                      }
                      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${security.twoFactorEnabled
                          ? "bg-cyan-500"
                          : "bg-gray-300 dark:bg-slate-600"
                        }`}
                    >
                      <span
                        className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${security.twoFactorEnabled
                            ? "translate-x-[18px]"
                            : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
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
                      <Save className="w-4 h-4" /> Update Security
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentSettingsPage;

