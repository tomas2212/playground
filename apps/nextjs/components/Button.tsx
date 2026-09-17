"use client";

type ButtonProps = {
    label: string;
    msg: string;
    onClick?: () => void
};

export default function Button({ label, msg, onClick }: ButtonProps) {
    return (
        <button
            // onClick={onClick}
            onClick={() => alert(msg)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
            {label}
        </button>
    );
}