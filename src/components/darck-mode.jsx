
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <Sun className="h-5 w-5 transition-all dark:hidden" />
      <Moon className="hidden h-5 w-5 transition-all dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}