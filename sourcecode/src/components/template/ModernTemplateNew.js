"use client"

import EditableField from "../EditableField";
import SectionControls from "../SectionControls";

const ModernTemplate = ({
  data,
  designSettings,
  onEdit,
  editMode,
  editValue,
  editFormatting,
  setEditValue,
  setEditFormatting,
  onSave,
  onCancel,
  sectionOrder,
  onDeleteSection,
  onMoveSection,
  hoveredSection,
  onSectionHover,
  pageIndex = 0,
  totalPages = 1,
}) => {
  const { colors } = designSettings

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Check if the date is in YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      const [year, month] = dateString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    return dateString;
  };

  // Function to get sections for the current page
  const getSectionsForPage = () => {
    // For simplicity, we'll show all sections on one page
    return sectionOrder;
  };

  // Helper function to render sections in the correct order
  const renderSections = () => {
    // Use our local getSectionsForPage function which shows all sections on one page
    const sectionsForThisPage = getSectionsForPage();

    // If this is a page beyond what we need, show a message
    if (sectionsForThisPage.length === 0 && pageIndex > 0) {
      return (
        <div className="empty-page-message">
          <p>This page is empty. You can add more content to your resume or remove this page.</p>
          <p>Current resume has {totalPages} pages.</p>
        </div>
      );
    }

    return sectionsForThisPage.map((section) => {
      const sectionId = section.id;
      const sectionData = data[sectionId];

      if (!sectionData) return null;

      const isHovered = hoveredSection === sectionId;

      let sectionContent = null;

      switch (sectionId) {
        case "summary":
          sectionContent = (
            <div className="summary-content">
              <EditableField
                value={sectionData}
                onEdit={() => onEdit("summary", sectionData)}
                isEditing={editMode === "summary"}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
                multiline={true}
              />
            </div>
          );
          break;

        case "experience":
          sectionContent = Array.isArray(sectionData) && sectionData.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <div className="experience-title-company">
                  <EditableField
                    value={exp.title}
                    onEdit={() => onEdit(`experience.${index}.title`, exp.title)}
                    isEditing={editMode === `experience.${index}.title`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="experience-title"
                    style={{ color: colors.primary }}
                  />
                  <EditableField
                    value={exp.company}
                    onEdit={() => onEdit(`experience.${index}.company`, exp.company)}
                    isEditing={editMode === `experience.${index}.company`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="experience-company"
                  />
                </div>
                <div className="experience-location-period">
                  <EditableField
                    value={exp.location}
                    onEdit={() => onEdit(`experience.${index}.location`, exp.location)}
                    isEditing={editMode === `experience.${index}.location`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="experience-location"
                  />
                  <EditableField
                    value={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate || 'Present')}`}
                    onEdit={() => onEdit(`experience.${index}.period`, `${formatDate(exp.startDate)} - ${formatDate(exp.endDate || 'Present')}`)}
                    isEditing={editMode === `experience.${index}.period`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="experience-period"
                  />
                </div>
              </div>
              <div className="experience-content">
                <ul className="experience-bullets">
                  {exp.highlights && exp.highlights.length > 0 ? (
                    exp.highlights.map((highlight, hIndex) => (
                      <li key={hIndex}>
                        <EditableField
                          value={highlight}
                          onEdit={() => onEdit(`experience.${index}.highlights.${hIndex}`, highlight)}
                          isEditing={editMode === `experience.${index}.highlights.${hIndex}`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                        />
                      </li>
                    ))
                  ) : null}
                </ul>
              </div>
            </div>
          ));
          break;

        case "education":
          sectionContent = (
            <div className="education-section">
              {Array.isArray(sectionData) && sectionData.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <EditableField
                      value={edu.degree}
                      onEdit={() => onEdit(`education.${index}.degree`, edu.degree)}
                      isEditing={editMode === `education.${index}.degree`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="education-degree"
                      style={{ color: colors.primary }}
                    />
                    <EditableField
                      value={edu.school}
                      onEdit={() => onEdit(`education.${index}.school`, edu.school)}
                      isEditing={editMode === `education.${index}.school`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="education-school"
                    />
                  </div>
                  <div className="education-location-year">
                    <EditableField
                      value={edu.location}
                      onEdit={() => onEdit(`education.${index}.location`, edu.location)}
                      isEditing={editMode === `education.${index}.location`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="education-location"
                    />
                    <EditableField
                      value={`${formatDate(edu.startDate)} - ${formatDate(edu.endDate || 'Present')}`}
                      onEdit={() => onEdit(`education.${index}.year`, `${formatDate(edu.startDate)} - ${formatDate(edu.endDate || 'Present')}`)}
                      isEditing={editMode === `education.${index}.year`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="education-year"
                    />
                  </div>
                </div>
              ))}
            </div>
          );
          break;

        case "skills":
          sectionContent = (
            <div className="skills-container">
              {Array.isArray(sectionData) && sectionData.map((skillItem, index) => {
                // Check if the skill item has category and items properties
                if (skillItem && typeof skillItem === 'object' && 'category' in skillItem && 'items' in skillItem) {
                  return (
                    <div key={index} className="skill-category">
                      <div className="skill-category-name">
                        <EditableField
                          value={skillItem.category}
                          onEdit={() => onEdit(`skills.${index}.category`, skillItem.category)}
                          isEditing={editMode === `skills.${index}.category`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                        />
                      </div>
                      <div className="skill-items">
                        {Array.isArray(skillItem.items) && skillItem.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="skill-item">
                            <EditableField
                              value={item}
                              onEdit={() => onEdit(`skills.${index}.items.${itemIndex}`, item)}
                              isEditing={editMode === `skills.${index}.items.${itemIndex}`}
                              editValue={editValue}
                              editFormatting={editFormatting}
                              setEditValue={setEditValue}
                              setEditFormatting={setEditFormatting}
                              onSave={onSave}
                              onCancel={onCancel}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  // Handle the case where skills are simple strings
                  return (
                    <div key={index} className="skill-item">
                      <EditableField
                        value={typeof skillItem === 'string' ? skillItem : JSON.stringify(skillItem)}
                        onEdit={() => onEdit(`skills.${index}`, skillItem)}
                        isEditing={editMode === `skills.${index}`}
                        editValue={editValue}
                        editFormatting={editFormatting}
                        setEditValue={setEditValue}
                        setEditFormatting={setEditFormatting}
                        onSave={onSave}
                        onCancel={onCancel}
                      />
                    </div>
                  );
                }
              })}
            </div>
          );
          break;

        case "projects":
          sectionContent = (
            <div className="projects-section">
              {Array.isArray(sectionData) && sectionData.map((project, index) => (
                <div key={index} className="project-item">
                  <div className="project-header">
                    <EditableField
                      value={project.name}
                      onEdit={() => onEdit(`projects.${index}.name`, project.name)}
                      isEditing={editMode === `projects.${index}.name`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="project-name"
                      style={{ color: colors.primary }}
                    />
                    <EditableField
                      value={project.link || ""}
                      onEdit={() => onEdit(`projects.${index}.link`, project.link || "")}
                      isEditing={editMode === `projects.${index}.link`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="project-link"
                    />
                  </div>
                  <EditableField
                    value={project.description}
                    onEdit={() => onEdit(`projects.${index}.description`, project.description)}
                    isEditing={editMode === `projects.${index}.description`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    multiline={true}
                    className="project-description"
                  />
                  <div className="project-technologies">
                    {project.technologies && project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="project-tech">
                        <EditableField
                          value={tech}
                          onEdit={() => onEdit(`projects.${index}.technologies.${techIndex}`, tech)}
                          isEditing={editMode === `projects.${index}.technologies.${techIndex}`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
          break;

        case "certifications":
          sectionContent = (
            <div className="certifications-section">
              {Array.isArray(sectionData) && sectionData.map((cert, index) => (
                <div key={index} className="certification-item">
                  <div className="certification-header">
                    <EditableField
                      value={cert.name}
                      onEdit={() => onEdit(`certifications.${index}.name`, cert.name)}
                      isEditing={editMode === `certifications.${index}.name`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="certification-name"
                      style={{ color: colors.primary }}
                    />
                    {cert.date && (
                      <EditableField
                        value={cert.date}
                        onEdit={() => onEdit(`certifications.${index}.date`, cert.date)}
                        isEditing={editMode === `certifications.${index}.date`}
                        editValue={editValue}
                        editFormatting={editFormatting}
                        setEditValue={setEditValue}
                        setEditFormatting={setEditFormatting}
                        onSave={onSave}
                        onCancel={onCancel}
                        className="certification-date"
                      />
                    )}
                  </div>
                  <EditableField
                    value={cert.issuer}
                    onEdit={() => onEdit(`certifications.${index}.issuer`, cert.issuer)}
                    isEditing={editMode === `certifications.${index}.issuer`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="certification-issuer"
                  />
                </div>
              ))}
            </div>
          );
          break;

        case "languages":
          sectionContent = (
            <div className="languages-section">
              {Array.isArray(sectionData) && sectionData.map((lang, index) => (
                <div key={index} className="language-item">
                  <EditableField
                    value={lang.language}
                    onEdit={() => onEdit(`languages.${index}.language`, lang.language)}
                    isEditing={editMode === `languages.${index}.language`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="language-name"
                    style={{ color: colors.primary }}
                  />
                  <EditableField
                    value={lang.proficiency}
                    onEdit={() => onEdit(`languages.${index}.proficiency`, lang.proficiency)}
                    isEditing={editMode === `languages.${index}.proficiency`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="language-proficiency"
                  />
                </div>
              ))}
            </div>
          );
          break;

        case "achievements":
          sectionContent = (
            <div className="achievements-section">
              {Array.isArray(sectionData) && sectionData.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <div className="achievement-header">
                    <EditableField
                      value={achievement.title}
                      onEdit={() => onEdit(`achievements.${index}.title`, achievement.title)}
                      isEditing={editMode === `achievements.${index}.title`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="achievement-title"
                      style={{ color: colors.primary }}
                    />
                    <EditableField
                      value={achievement.date}
                      onEdit={() => onEdit(`achievements.${index}.date`, achievement.date)}
                      isEditing={editMode === `achievements.${index}.date`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="achievement-date"
                    />
                  </div>
                  <EditableField
                    value={achievement.organization}
                    onEdit={() => onEdit(`achievements.${index}.organization`, achievement.organization)}
                    isEditing={editMode === `achievements.${index}.organization`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="achievement-organization"
                  />
                  <EditableField
                    value={achievement.description}
                    onEdit={() => onEdit(`achievements.${index}.description`, achievement.description)}
                    isEditing={editMode === `achievements.${index}.description`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    multiline={true}
                    className="achievement-description"
                  />
                </div>
              ))}
            </div>
          );
          break;

        default:
          sectionContent = null;
          break;
      }

      return (
        <div
          key={sectionId}
          className="resume-section"
          onMouseEnter={() => onSectionHover(sectionId, true)}
          onMouseLeave={() => onSectionHover(sectionId, false)}
        >
          <div className="section-header">
            <h2 className="section-title" style={{ color: colors.primary }}>
              {section.title}
            </h2>
            {isHovered && (
              <SectionControls
                onDelete={() => onDeleteSection(sectionId)}
                onMoveUp={() => onMoveSection(sectionId, "up")}
                onMoveDown={() => onMoveSection(sectionId, "down")}
              />
            )}
          </div>
          {sectionContent}
        </div>
      );
    });
  };

  // Only show the header on the first page
  const showHeader = pageIndex === 0;

  return (
    <div className="resume-template modern-template">
      {showHeader && (
        <div className="resume-header" style={{ borderBottom: `2px solid ${colors.primary}` }}>
          <div className="resume-header-content">
            <div className="resume-name-title">
              <EditableField
                value={data.name}
                onEdit={() => onEdit("name", data.name)}
                isEditing={editMode === "name"}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
                className="resume-name"
                style={{ color: colors.primary }}
              />
              <EditableField
                value={data.title}
                onEdit={() => onEdit("title", data.title)}
                isEditing={editMode === "title"}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
                className="resume-title"
              />
            </div>
          </div>
          <div className="resume-contact">
            {data.email && (
              <div className="resume-contact-item">
                <span className="contact-icon">📧</span>
                <EditableField
                  value={data.email}
                  onEdit={() => onEdit("email", data.email)}
                  isEditing={editMode === "email"}
                  editValue={editValue}
                  editFormatting={editFormatting}
                  setEditValue={setEditValue}
                  setEditFormatting={setEditFormatting}
                  onSave={onSave}
                  onCancel={onCancel}
                />
              </div>
            )}
            {data.phone && (
              <div className="resume-contact-item">
                <span className="contact-icon">📱</span>
                <EditableField
                  value={data.phone}
                  onEdit={() => onEdit("phone", data.phone)}
                  isEditing={editMode === "phone"}
                  editValue={editValue}
                  editFormatting={editFormatting}
                  setEditValue={setEditValue}
                  setEditFormatting={setEditFormatting}
                  onSave={onSave}
                  onCancel={onCancel}
                />
              </div>
            )}
            {data.location && (
              <div className="resume-contact-item">
                <span className="contact-icon">📍</span>
                <EditableField
                  value={data.location}
                  onEdit={() => onEdit("location", data.location)}
                  isEditing={editMode === "location"}
                  editValue={editValue}
                  editFormatting={editFormatting}
                  setEditValue={setEditValue}
                  setEditFormatting={setEditFormatting}
                  onSave={onSave}
                  onCancel={onCancel}
                />
              </div>
            )}
            {data.website && (
              <div className="resume-contact-item">
                <span className="contact-icon">🌐</span>
                <EditableField
                  value={data.website}
                  onEdit={() => onEdit("website", data.website)}
                  isEditing={editMode === "website"}
                  editValue={editValue}
                  editFormatting={editFormatting}
                  setEditValue={setEditValue}
                  setEditFormatting={setEditFormatting}
                  onSave={onSave}
                  onCancel={onCancel}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {renderSections()}
    </div>
  );
};

export default ModernTemplate;
