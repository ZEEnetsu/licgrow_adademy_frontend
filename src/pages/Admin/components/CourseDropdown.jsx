import React, { useState } from "react";
import arrowDropDown from "../../../assets/arrow_drop_down.svg";

const ModuleAccordion = ({ module, idx }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="module-accordion rounded-xl bg-surface-elevated text-text-primary hover:bg-surface-elevated-hover">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`module-header ${isOpen ? "open" : ""}`}
      >
        <span className="module-title">
          <span>MODULE {idx + 1}.</span>
          <span>{module.title}</span>
        </span>
        <img
          src={arrowDropDown}
          alt="Toggle Arrow"
          className={`arrow-icon ${isOpen ? "rotated" : ""}`}
        />
      </div>

      {/* Animated collapsible */}
      <div className={`chapters-wrapper ${isOpen ? "open" : ""}`}>
        <div className="chapters-inner">
          {Object.values(module.chapter).map((chapter, chapIdx) => (
            <div
              key={chapter.id || chapIdx}
              className="chapter-row"
            >
              <span className="chapter-index">CHAPTER {chapIdx + 1}.</span>
              <span className="chapter-title">{chapter.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CourseDropdown = ({ data }) => {
  if (!data)
    return <p className="no-data">No course curriculum available.</p>;

  return (
    <div className="course-dropdown">
      <div className="modules-list">
        {Object.values(data).map((module, idx) => (
          <ModuleAccordion key={module.id} module={module} idx={idx} />
        ))}
      </div>
    </div>
  );
};

export default CourseDropdown;