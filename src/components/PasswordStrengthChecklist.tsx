import { useMemo } from "react";
import { Check } from "lucide-react";
import { evaluatePasswordStrength } from "../utils/passwordStrength";

type PasswordStrengthChecklistProps = {
  password: string;
  showMeter?: boolean;
  title?: string;
  className?: string;
};

const PasswordStrengthChecklist = ({
  password,
  showMeter = true,
  title,
  className = "",
}: PasswordStrengthChecklistProps) => {
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  return (
    <div className={className}>
      {title && <p className="text-xs font-medium text-gray-500 mb-2">{title}</p>}

      {showMeter && (
        <div className="space-y-2 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">Strength: {strength.label}</span>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${strength.score >= 85
                ? "bg-emerald-500"
                : strength.score >= 70
                  ? "bg-green-500"
                  : strength.score >= 55
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {strength.checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2 text-xs">
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${check.passed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                }`}
            >
              <Check className="h-3 w-3" />
            </span>
            <span className={check.passed ? "text-gray-700" : "text-gray-500"}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthChecklist;
