import EditableField from "../EditableField";
import SectionControls from "../SectionControls";

const ProfessionalTemplate = ({
  data = {},
  designSettings = { colors: { primary: '#2c78d4' } },
  onEdit,
  editMode,
  editValue,
  editFormatting,
  setEditValue,
  setEditFormatting,
  onSave,
  onCancel,
  sectionOrder = [],
  onDeleteSection,
  onMoveSection,
  hoveredSection,
  onSectionHover,
  pageIndex = 0,
  totalPages = 1,
  getSectionsForPage = null,
}) => {
  const { colors } = designSettings || { colors: { primary: '#2c78d4' } }

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

  // If data is not provided, return an empty template
  if (!data) {
    return <div className="resume-template professional-template">No data available</div>;
  }

  // Helper function to render sections in the correct order
  const renderSections = () => {
    // Always use getSectionsForPage if provided, as it has the improved pagination logic
    // Otherwise fall back to a simpler calculation
    const sectionsForThisPage = getSectionsForPage
      ? getSectionsForPage(pageIndex)
      : (() => {
          // If no pagination function is provided, just return all sections for the first page
          if (pageIndex === 0) {
            return sectionOrder;
          }
          return [];
        })();

    // If this is a page beyond what we need, show a message
    if (sectionsForThisPage.length === 0) {
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

      // Extract visibility information from the section
      const visibility = section._visibility || {};
      const continuesFromPrevious = visibility.continuesFromPrevious || false;
      const continuesToNext = visibility.continuesToNext || false;

      if (!sectionData) return null;

      const isHovered = hoveredSection === sectionId;

      let sectionContent;

      switch (sectionId) {
        case "summary":
          sectionContent = (
            <div className="section-content">
              <EditableField
                value={sectionData || ""}
                onEdit={() => onEdit("summary", sectionData || "")}
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
          sectionContent = (
            <div className="section-content">
              {Array.isArray(sectionData) && sectionData.map((exp, index) => (
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
                        value={
                          exp.period ? formatDate(exp.period) :
                          (exp.startDate || exp.endDate) ?
                            `${formatDate(exp.startDate || "")} - ${formatDate(exp.endDate || "Present")}` :
                            ""
                        }
                        onEdit={() => onEdit(`experience.${index}.period`,
                          exp.period ? exp.period :
                          (exp.startDate || exp.endDate) ?
                            `${formatDate(exp.startDate || "")} - ${formatDate(exp.endDate || "Present")}` :
                            ""
                        )}
                        isEditing={editMode === `experience.${index}.period`}
                        editValue={editValue}
                        editFormatting={editFormatting}
                        setEditValue={setEditValue}
                        setEditFormatting={setEditFormatting}
                        onSave={onSave}
                        onCancel={onCancel}
                        className="experience-period"
                        style={{ fontWeight: 'bold' }}
                      />
                    </div>
                  </div>
                  <ul className="experience-bullets">
                    {exp.bullets && Array.isArray(exp.bullets) && exp.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>
                        <EditableField
                          value={bullet}
                          onEdit={() => onEdit(`experience.${index}.bullets.${bulletIndex}`, bullet)}
                          isEditing={editMode === `experience.${index}.bullets.${bulletIndex}`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
          break;

        case "education":
          sectionContent = (
            <div className="section-content">
              {Array.isArray(sectionData) && sectionData.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <div className="education-degree-school">
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
                        value={
                          edu.year ? formatDate(edu.year) :
                          (edu.startDate || edu.endDate) ?
                            `${formatDate(edu.startDate || "")} - ${formatDate(edu.endDate || "Present")}` :
                            ""
                        }
                        onEdit={() => onEdit(`education.${index}.year`,
                          edu.year ? edu.year :
                          (edu.startDate || edu.endDate) ?
                            `${formatDate(edu.startDate || "")} - ${formatDate(edu.endDate || "Present")}` :
                            ""
                        )}
                        isEditing={editMode === `education.${index}.year`}
                        editValue={editValue}
                        editFormatting={editFormatting}
                        setEditValue={setEditValue}
                        setEditFormatting={setEditFormatting}
                        onSave={onSave}
                        onCancel={onCancel}
                        className="education-year"
                        style={{ fontWeight: 'bold' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
          break;

        case "skills":
          sectionContent = (
            <div className="section-content">
              <div className="skills-container">
                {Array.isArray(sectionData) && sectionData.map((skillItem, index) => {
                  // Check if the skill item has category and items properties
                  if (skillItem && typeof skillItem === 'object' && 'category' in skillItem && 'items' in skillItem) {
                    return (
                      <div key={index} className="skill-category" style={{ marginBottom: '16px' }}>
                        <div className="skill-category-name" style={{ color: colors.primary, fontWeight: 'bold', marginBottom: '8px' }}>
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
                        <div className="skill-items" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {Array.isArray(skillItem.items) && skillItem.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="skill-item" style={{ backgroundColor: `${colors.primary}20` }}>
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
                      <div key={index} className="skill-item" style={{ backgroundColor: `${colors.primary}20` }}>
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
            </div>
          );
          break;

        case "projects":
          sectionContent = (
            <div className="section-content">
              <div className="projects-section">
                {Array.isArray(sectionData) && sectionData.map((project, index) => (
                  <div key={index} className="project-item">
                    <div className="project-header">
                      <EditableField
                        value={project.name || ""}
                        onEdit={() => onEdit(`projects.${index}.name`, project.name || "")}
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
                      {project.date && (
                        <EditableField
                          value={formatDate(project.date) || ""}
                          onEdit={() => onEdit(`projects.${index}.date`, project.date || "")}
                          isEditing={editMode === `projects.${index}.date`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          className="project-date"
                        />
                      )}
                    </div>
                    {project.link && (
                      <div className="project-link">
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
                        />
                      </div>
                    )}
                    {project.description && (
                      <div className="project-description">
                        <EditableField
                          value={project.description || ""}
                          onEdit={() => onEdit(`projects.${index}.description`, project.description || "")}
                          isEditing={editMode === `projects.${index}.description`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          multiline={true}
                        />
                      </div>
                    )}
                    {project.technologies && Array.isArray(project.technologies) && (
                      <div className="project-technologies">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="project-tech">
                            <EditableField
                              value={tech || ""}
                              onEdit={() => onEdit(`projects.${index}.technologies.${techIndex}`, tech || "")}
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "certifications":
          sectionContent = (
            <div className="section-content">
              <div className="certifications-section">
                {Array.isArray(sectionData) && sectionData.map((cert, index) => (
                  <div key={index} className="certification-item">
                    <div className="certification-header">
                      <EditableField
                        value={cert.name || ""}
                        onEdit={() => onEdit(`certifications.${index}.name`, cert.name || "")}
                        isEditing={editMode === `certifications.${index}.name`}
                        editValue={editValue}
                        editFormatting={editFormatting}
                        setEditValue={setEditValue}
                        setEditFormatting={setEditFormatting}
                        onSave={onSave}
                        onCancel={onCancel}
                        className="certification-name"
                      />
                      {cert.date && (
                        <EditableField
                          value={formatDate(cert.date) || ""}
                          onEdit={() => onEdit(`certifications.${index}.date`, cert.date || "")}
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
                    {cert.issuer && (
                      <div className="certification-issuer">
                        <EditableField
                          value={cert.issuer || ""}
                          onEdit={() => onEdit(`certifications.${index}.issuer`, cert.issuer || "")}
                          isEditing={editMode === `certifications.${index}.issuer`}
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
                ))}
              </div>
            </div>
          );
          break;

        case "languages":
          sectionContent = (
            <div className="section-content">
              <div className="languages-section">
                {Array.isArray(sectionData) && sectionData.map((lang, index) => (
                  <div key={index} className="language-item">
                    <EditableField
                      value={lang.language || ""}
                      onEdit={() => onEdit(`languages.${index}.language`, lang.language || "")}
                      isEditing={editMode === `languages.${index}.language`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="language-name"
                    />
                    {lang.proficiency && (
                      <EditableField
                        value={lang.proficiency || ""}
                        onEdit={() => onEdit(`languages.${index}.proficiency`, lang.proficiency || "")}
                        isEditing={editMode === `languages.${index}.proficiency`}
                        editValue={editValue}
                        editFormatting={editFormatting}
                        setEditValue={setEditValue}
                        setEditFormatting={setEditFormatting}
                        onSave={onSave}
                        onCancel={onCancel}
                        className="language-proficiency"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "achievements":
          sectionContent = (
            <div className="section-content">
              <div className="achievements-section">
                {Array.isArray(sectionData) && sectionData.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-header">
                      <EditableField
                        value={achievement.title || ""}
                        onEdit={() => onEdit(`achievements.${index}.title`, achievement.title || "")}
                        isEditing={editMode === `achievements.${index}.title`}
                        editValue={editValue}
                        editFormatting={editFormatting}
                        setEditValue={setEditValue}
                        setEditFormatting={setEditFormatting}
                        onSave={onSave}
                        onCancel={onCancel}
                        className="achievement-title"
                      />
                      {achievement.date && (
                        <EditableField
                          value={formatDate(achievement.date) || ""}
                          onEdit={() => onEdit(`achievements.${index}.date`, achievement.date || "")}
                          isEditing={editMode === `achievements.${index}.date`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          className="achievement-date"
                        />
                      )}
                    </div>
                    {achievement.description && (
                      <div className="achievement-description">
                        <EditableField
                          value={achievement.description || ""}
                          onEdit={() => onEdit(`achievements.${index}.description`, achievement.description || "")}
                          isEditing={editMode === `achievements.${index}.description`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          multiline={true}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "volunteer":
          sectionContent = (
            <div className="section-content">
              <div className="volunteer-section">
                {Array.isArray(sectionData) && sectionData.map((volunteer, index) => (
                  <div key={index} className="volunteer-item" style={{ marginBottom: '16px' }}>
                    <div className="volunteer-header">
                      <div className="volunteer-title-org">
                        <EditableField
                          value={volunteer.position || volunteer.role || ''}
                          onEdit={() => onEdit(`volunteer.${index}.position`, volunteer.position || volunteer.role || '')}
                          isEditing={editMode === `volunteer.${index}.position`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          className="volunteer-position"
                          style={{ color: colors.primary }}
                        />
                        <EditableField
                          value={volunteer.organization || ''}
                          onEdit={() => onEdit(`volunteer.${index}.organization`, volunteer.organization || '')}
                          isEditing={editMode === `volunteer.${index}.organization`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          className="volunteer-organization"
                        />
                      </div>
                      <div className="volunteer-period">
                        <EditableField
                          value={volunteer.period || (volunteer.startDate && volunteer.endDate ? formatDate(volunteer.startDate) + ' - ' + formatDate(volunteer.endDate || 'Present') : '')}
                          onEdit={() => onEdit(`volunteer.${index}.period`, volunteer.period || (volunteer.startDate && volunteer.endDate ? formatDate(volunteer.startDate) + ' - ' + formatDate(volunteer.endDate || 'Present') : ''))}
                          isEditing={editMode === `volunteer.${index}.period`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          className="volunteer-period"
                        />
                      </div>
                    </div>
                    {(volunteer.summary || volunteer.description) && (
                      <div className="volunteer-description">
                        <EditableField
                          value={volunteer.summary || volunteer.description || ''}
                          onEdit={() => onEdit(`volunteer.${index}.summary`, volunteer.summary || volunteer.description || '')}
                          isEditing={editMode === `volunteer.${index}.summary`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                          multiline={true}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        default:
          sectionContent = null;
      }

      return (
        <div
          key={sectionId}
          className="resume-section"
          onMouseEnter={() => onSectionHover && onSectionHover(sectionId, true)}
          onMouseLeave={() => onSectionHover && onSectionHover(sectionId, false)}
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

  return (
    <div className="resume-template professional-template">
      <div className="resume-header" style={{ backgroundColor: colors.primary }}>
        <div className="resume-name-title">
          <EditableField
            value={data.name || ""}
            onEdit={() => onEdit("name", data.name || "")}
            isEditing={editMode === "name"}
            editValue={editValue}
            editFormatting={editFormatting}
            setEditValue={setEditValue}
            setEditFormatting={setEditFormatting}
            onSave={onSave}
            onCancel={onCancel}
            className="resume-name"
            style={{ color: "#ffffff" }}
          />
          <EditableField
            value={data.title || ""}
            onEdit={() => onEdit("title", data.title || "")}
            isEditing={editMode === "title"}
            editValue={editValue}
            editFormatting={editFormatting}
            setEditValue={setEditValue}
            setEditFormatting={setEditFormatting}
            onSave={onSave}
            onCancel={onCancel}
            className="resume-title"
            style={{ color: "#ffffff" }}
          />
        </div>
      </div>

      {data.contact && (
        <div className="resume-contact-bar">
          <div className="contact-item">
            <span className="contact-icon">📱</span>
            <EditableField
              value={data.contact.phone || ""}
              onEdit={() => onEdit("contact.phone", data.contact.phone || "")}
              isEditing={editMode === "contact.phone"}
              editValue={editValue}
              editFormatting={editFormatting}
              setEditValue={setEditValue}
              setEditFormatting={setEditFormatting}
              onSave={onSave}
              onCancel={onCancel}
            />
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <EditableField
              value={data.contact.email || ""}
              onEdit={() => onEdit("contact.email", data.contact.email || "")}
              isEditing={editMode === "contact.email"}
              editValue={editValue}
              editFormatting={editFormatting}
              setEditValue={setEditValue}
              setEditFormatting={setEditFormatting}
              onSave={onSave}
              onCancel={onCancel}
            />
          </div>
          <div className="contact-item">
            <span className="contact-icon">🔗</span>
            <EditableField
              value={data.contact.linkedin || ""}
              onEdit={() => onEdit("contact.linkedin", data.contact.linkedin || "")}
              isEditing={editMode === "contact.linkedin"}
              editValue={editValue}
              editFormatting={editFormatting}
              setEditValue={setEditValue}
              setEditFormatting={setEditFormatting}
              onSave={onSave}
              onCancel={onCancel}
            />
          </div>
        </div>
      )}

      <div className="resume-body">
        {renderSections()}
      </div>
    </div>
  )
}

export default ProfessionalTemplate
