import React, { useId, useState } from 'react';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** When false, renders a static heading with the content always visible. */
  collapsible?: boolean;
  className?: string;
};

const TITLE_CLASS = 'text-sm font-semibold text-tech-goldMedium';

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  collapsible = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const buttonId = useId();
  const panelId = useId();

  if (!collapsible) {
    return (
      <section className={className}>
        <h2 className={TITLE_CLASS}>{title}</h2>
        {children}
      </section>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`focus-ring flex w-full items-center justify-between ${TITLE_CLASS}`}
      >
        <span>{title}</span>
        <span aria-hidden="true" className="text-lg">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
};

export default Accordion;
