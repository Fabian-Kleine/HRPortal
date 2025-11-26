"use client";

import { useState, useEffect, useMemo } from "react";
import Holidays from "date-holidays";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";

interface HolidayRegionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function HolidayRegionSelector({
  value,
  onChange,
  disabled = false,
}: HolidayRegionSelectorProps) {
  const t = useTranslations("HRManager.settings");
  
  // Parse the value into country and state
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    if (!value) return "";
    // Value can be "DE" or "DE-NW" format
    return value.split("-")[0];
  });
  
  const [selectedState, setSelectedState] = useState<string>(() => {
    if (!value || !value.includes("-")) return "";
    return value;
  });

  // Get all countries from date-holidays
  const countries = useMemo(() => {
    const hd = new Holidays();
    const countriesObj = hd.getCountries();
    return Object.entries(countriesObj).map(([code, name]) => ({
      code,
      name: name as string,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Get states/regions for the selected country
  const states = useMemo(() => {
    if (!selectedCountry) return [];
    const hd = new Holidays();
    const statesObj = hd.getStates(selectedCountry);
    if (!statesObj) return [];
    return Object.entries(statesObj).map(([code, name]) => ({
      code: `${selectedCountry}-${code}`,
      name: name as string,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCountry]);

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      setSelectedCountry(parts[0]);
      if (parts.length > 1) {
        setSelectedState(value);
      } else {
        setSelectedState("");
      }
    }
  }, [value]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedState("");
    // Check if country has states
    const hd = new Holidays();
    const statesObj = hd.getStates(countryCode);
    if (!statesObj || Object.keys(statesObj).length === 0) {
      // No states, use country directly
      onChange(countryCode);
    }
    // If there are states, wait for user to select one (or they can leave it at country level)
    onChange(countryCode);
  };

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    if (stateCode === "none") {
      onChange(selectedCountry);
    } else {
      onChange(stateCode);
    }
  };

  return (
    <div className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel htmlFor="holidayCountry">{t("holidayCountry")}</FieldLabel>
        <FieldDescription>
          {t("holidayCountryDescription")}
        </FieldDescription>
        <Select
          value={selectedCountry}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger id="holidayCountry" className="w-full">
            <SelectValue placeholder={t("selectCountry")} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {states.length > 0 && (
        <Field orientation="vertical">
          <FieldLabel htmlFor="holidayState">{t("holidayState")}</FieldLabel>
          <FieldDescription>
            {t("holidayStateDescription")}
          </FieldDescription>
          <Select
            value={selectedState || "none"}
            onValueChange={handleStateChange}
            disabled={disabled}
          >
            <SelectTrigger id="holidayState" className="w-full">
              <SelectValue placeholder={t("selectState")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("countryWide")}</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    </div>
  );
}

// Helper function to get the display name for a holiday region code
export function getHolidayRegionName(code: string): string {
  if (!code) return "";
  
  const hd = new Holidays();
  const parts = code.split("-");
  const countryCode = parts[0];
  
  const countries = hd.getCountries();
  const countryName = countries[countryCode] || countryCode;
  
  if (parts.length > 1) {
    const states = hd.getStates(countryCode);
    if (states) {
      const stateCode = parts.slice(1).join("-");
      const stateName = states[stateCode];
      if (stateName) {
        return `${countryName} - ${stateName}`;
      }
    }
  }
  
  return countryName as string;
}
