import React from "react";

/**
 * SectionWithCards — reusable section primitive
 *
 * Props:
 *   id?         — HTML id for anchor links
 *   headingIcon — /landing/xxx.svg path for the badge icon
 *   heading     — section title text
 *   lead        — lead paragraph text
 *   items       — Array<{ title, desc, icon }>
 *   cols?       — 2 | 3  (default 3)
 *   footer?     — optional React node rendered below the grid
 */
export function SectionWithCards({
  id,
  headingIcon,
  heading,
  lead,
  items = [],
  cols = 3,
  footer,
}) {
  const gridClass = cols === 2 ? "hpw-cards-grid-2" : "hpw-cards-grid-3";

  return (
    <section id={id} className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <span className="hpw-heading-icon-badge">
          <img src={headingIcon} alt="" className="hpw-heading-icon" />
        </span>
        {heading}
      </h2>
      {lead && <p className="hpw-lead-text">{lead}</p>}

      <div className={gridClass}>
        {items.map((item, i) => (
          <div key={i} className="hpw-item-box">
            <h4>
              <span className="hpw-icon-badge" style={{ width: 30, height: 30 }}>
                <img
                  src={item.icon}
                  alt=""
                  className="hpw-landing-icon"
                  style={{ width: 16, height: 16 }}
                />
              </span>
              {item.title}
            </h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      {footer && <div style={{ marginTop: "24px" }}>{footer}</div>}
    </section>
  );
}

/**
 * SectionWithSteps — reusable numbered-steps section primitive
 *
 * Props:
 *   id?         — HTML id
 *   headingIcon — /landing/xxx.svg
 *   heading     — section title
 *   lead        — lead paragraph
 *   steps       — Array<{ step, title, desc, icon }>
 *   stepLabel?  — prefix text before the step number (default "Step ")
 *   footer?     — optional React node rendered below steps
 */
export function SectionWithSteps({
  id,
  headingIcon,
  heading,
  lead,
  steps = [],
  stepLabel = "Step ",
  footer,
}) {
  return (
    <section id={id} className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <span className="hpw-heading-icon-badge">
          <img src={headingIcon} alt="" className="hpw-heading-icon" />
        </span>
        {heading}
      </h2>
      {lead && <p className="hpw-lead-text">{lead}</p>}

      <div className="hpw-numbered-steps">
        {steps.map((item, i) => (
          <div key={i} className="hpw-step-item">
            <span className="hpw-step-badge">
              {stepLabel}{item.step}
            </span>
            {item.icon && (
              <span className="hpw-icon-badge">
                <img src={item.icon} alt="" className="hpw-landing-icon" />
              </span>
            )}
            <div className="hpw-step-content">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {footer && <div style={{ marginTop: "24px" }}>{footer}</div>}
    </section>
  );
}
