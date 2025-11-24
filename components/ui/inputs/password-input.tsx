"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../input-group";

interface PasswordInputProps {
    id?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    isInvalid?: boolean;
    required?: boolean;
}

export default function PasswordInput({
    id = "password",
    placeholder,
    value,
    onChange,
    disabled = false,
    isInvalid = false,
    required = false
}: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible((v) => !v);

    return (
        <InputGroup>
            <InputGroupInput
                id={id}
                name="password"
                placeholder={placeholder}
                autoComplete="current-password"
                type={isVisible ? "text" : "password"}
                value={value}
                onChange={onChange}
                disabled={disabled}
                aria-invalid={isInvalid}
                required={required}
            />
            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    aria-label="toggle password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                >
                    {isVisible ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                    ) : (
                        <Eye className="size-4 text-muted-foreground" />
                    )}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}