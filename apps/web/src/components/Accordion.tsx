import React, { useId, useState } from 'react';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
};

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
  buttonClassName = '',
  panelClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const buttonId = useId();
  const panelId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={buttonClassName}
      >
        <span>{title}</span>
        <span aria-hidden="true" className="text-lg">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className={panelClassName}
      >
        {children}
      </div>
    </div>
  );
};

export default Accordion;
