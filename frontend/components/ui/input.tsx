import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", error, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={[
                    "w-full text-sm px-3 py-2 rounded-lg border bg-white",
                    "placeholder:text-slate-400 text-slate-800",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-colors",
                    error
                        ? "border-red-400 focus:ring-red-300"
                        : "border-slate-300",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };