import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";

interface NeoRichTextEditorProps {
    initialValue?: string;
    // receives the HTML string directly, not a DOM event
    onBlur: (html: string) => void;
}

function NeoRichTextEditor({ initialValue = "", onBlur }: NeoRichTextEditorProps) {
    const ref = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    // Handles both immediate mount and late-arriving initialValue (e.g. after async fetch)
    useEffect(() => {
        if (ref.current && !initialized.current && initialValue) {
            ref.current.innerHTML = initialValue;
            initialized.current = true;
        }
    }, [initialValue]);

    const exec = (cmd: string) => {
        ref.current?.focus();
        document.execCommand(cmd, false);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
                {(
                    [
                        ["bold", Bold],
                        ["italic", Italic],
                        ["underline", Underline],
                    ] as const
                ).map(([cmd, Icon]) => (
                    <button
                        key={cmd}
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            exec(cmd);
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded text-slate-600"
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                ))}

                <div className="w-px h-5 bg-slate-300 mx-1" />

                <button
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        exec("insertUnorderedList");
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded text-slate-600"
                >
                    <List className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        exec("insertOrderedList");
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded text-slate-600"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
            </div>

            {/* Editable area */}
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onBlur={() => ref.current && onBlur(ref.current.innerHTML)}
                className="min-h-[180px] p-4 text-sm text-slate-800 outline-none [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ol]:list-decimal [&_ol]:ml-5 [&_ul]:list-disc [&_ul]:ml-5"
            />
        </div>
    );
}

export default NeoRichTextEditor;