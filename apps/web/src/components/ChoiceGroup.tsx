import React, { useId } from 'react';

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  /** Second line, tile variant only. */
  description?: string;
};

type ChoiceGroupProps<T extends string> = {
  legend: string;
  legendClassName?: string;
  options: ReadonlyArray<ChoiceOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** `pill`: inline chips. `tile`: stacked two-line cards. */
  variant?: 'pill' | 'tile';
  children?: React.ReactNode;
};

/**
 * A radio group rendered as pills or tiles. Uses native inputs so keyboard
 * navigation and screen-reader semantics come for free.
 */
const ChoiceGroup = <T extends string>({
  legend,
  legendClassName = 'eyebrow',
  options,
  value,
  onChange,
  variant = 'pill',
  children
}: ChoiceGroupProps<T>) => {
  const name = useId();
  const isTile = variant === 'tile';

  return (
    <fieldset>
      <legend className={legendClassName}>{legend}</legend>
      <div className={isTile ? 'mt-3 grid gap-2' : 'mt-2 flex flex-wrap gap-2'}>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              className="choice-input"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {isTile ? (
              <span className="tile">
                <span className="block text-sm font-semibold leading-tight tracking-[0.08em] text-tech-navy sm:text-base">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="block text-[10px] leading-tight tracking-[0.06em] text-tech-navy/70">
                    {option.description}
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="pill">{option.label}</span>
            )}
          </label>
        ))}
      </div>
      {children}
    </fieldset>
  );
};

export default ChoiceGroup;
