import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Language options
  const options = {
    english: "English",
    spanish: "Spanish",
    french: "French",
    hindi: "Hindi"
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options[value] || value}
        <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
          <div className="p-1">
            {Object.keys(options).map((optionValue) => (
              <div
                key={optionValue}
                className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                  value === optionValue ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => {
                  onValueChange(optionValue);
                  setIsOpen(false);
                }}
              >
                {options[optionValue]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};