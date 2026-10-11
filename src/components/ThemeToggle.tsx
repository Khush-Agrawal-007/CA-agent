import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
      className={`clay-btn p-2 rounded-xl flex items-center justify-center transition-all ${className}`}
      title={`Switch to ${actualTheme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {actualTheme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
export default ThemeToggle;
