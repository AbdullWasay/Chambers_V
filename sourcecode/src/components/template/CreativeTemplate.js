import EditableField from "../EditableField";
import SectionControls from "../SectionControls";

const CreativeTemplate = ({
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
  pageIndex = 0,
  totalPages = 1,
  getSectionsForPage = null,
  sectionOrder = [],
  onDeleteSection,
  onMoveSection,
  hoveredSection,
  onSectionHover
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
                <div key={index} className="experience-item" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1, maxWidth: '70%' }}>
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
                        style={{
                          color: colors.primary,
                          fontWeight: '600',
                          fontSize: '16px',
                          marginBottom: '4px',
                          display: 'block'
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', fontSize: '14px' }}>
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
                          style={{ fontWeight: '500' }}
                        />
                        {exp.location && (
                          <>
                            <span className="experience-separator" style={{ margin: '0 8px', color: '#ccc' }}>|</span>
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
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ minWidth: '120px', textAlign: 'right' }}>
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
                        style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}
                      />
                    </div>
                  </div>
                  {exp.highlights && Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                    <ul className="experience-bullets" style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '0' }}>
                      {exp.highlights.map((highlight, hIndex) => (
                        <li key={hIndex} style={{ marginBottom: '4px' }}>
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
                            style={{ fontSize: '14px' }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          );
          break;

        case "education":
          sectionContent = (
            <div className="section-content">
              {Array.isArray(sectionData) && sectionData.map((edu, index) => (
                <div key={index} className="education-item" style={{ marginBottom: '20px' }}>
                  {/* Degree on its own line */}
                  <div style={{ marginBottom: '4px' }}>
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
                      style={{
                        color: colors.primary,
                        fontWeight: '600',
                        fontSize: '16px',
                        display: 'block'
                      }}
                    />
                  </div>

                  {/* School and location on second line */}
                  <div style={{ marginBottom: '4px', fontSize: '14px' }}>
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
                      style={{ fontWeight: '500' }}
                    />
                    {edu.location && (
                      <>
                        <span className="education-separator" style={{ margin: '0 8px', color: '#ccc' }}>|</span>
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
                      </>
                    )}
                  </div>

                  {/* Date on third line */}
                  <div style={{ fontSize: '14px', color: '#555' }}>
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
                  <div key={index} className="project-item" style={{ marginBottom: '16px' }}>
                    <div className="project-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
                        style={{ color: colors.primary, fontWeight: 'bold' }}
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
                      <div className="project-link" style={{ marginBottom: '4px', fontSize: '0.9em' }}>
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
                          style={{ color: colors.primary }}
                        />
                      </div>
                    )}
                    {project.description && (
                      <div className="project-description" style={{ marginBottom: '8px' }}>
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
                      <div className="project-technologies" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="project-tech" style={{ backgroundColor: `${colors.primary}20`, padding: '2px 8px', borderRadius: '4px' }}>
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
                  <div key={index} className="certification-item" style={{ marginBottom: '12px' }}>
                    <div className="certification-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
                        style={{ color: colors.primary, fontWeight: 'bold' }}
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
              <div className="languages-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {Array.isArray(sectionData) && sectionData.map((lang, index) => (
                  <div key={index} className="language-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: `${colors.primary}10`, padding: '4px 12px', borderRadius: '4px' }}>
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
                      style={{ color: colors.primary, fontWeight: 'bold' }}
                    />
                    {lang.proficiency && (
                      <>
                        <span>-</span>
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
                      </>
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
                  <div key={index} className="achievement-item" style={{ marginBottom: '16px' }}>
                    <div className="achievement-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
                        style={{ color: colors.primary, fontWeight: 'bold' }}
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
                    {achievement.organization && (
                      <div className="achievement-organization" style={{ marginBottom: '4px' }}>
                        <EditableField
                          value={achievement.organization || ""}
                          onEdit={() => onEdit(`achievements.${index}.organization`, achievement.organization || "")}
                          isEditing={editMode === `achievements.${index}.organization`}
                          editValue={editValue}
                          editFormatting={editFormatting}
                          setEditValue={setEditValue}
                          setEditFormatting={setEditFormatting}
                          onSave={onSave}
                          onCancel={onCancel}
                        />
                      </div>
                    )}
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
                    <div className="volunteer-header" style={{ marginBottom: '4px' }}>
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
                        style={{ color: colors.primary, fontWeight: 'bold' }}
                      />
                    </div>
                    <div className="volunteer-subheader" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
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
    <div className="resume-template creative-template">
      <div className="resume-sidebar" style={{ backgroundColor: colors.primary }}>
        <div className="sidebar-photo">
          {data.photo ? (
            <img src={data.photo || "/placeholder.svg"} alt={data.name} />
          ) : (
            <div className="photo-placeholder">
              {data.name
                ? data.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                : ""}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Contact</h3>
          <div className="sidebar-content">
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <EditableField
                value={data.contact?.phone || ""}
                onEdit={() => onEdit("contact.phone", data.contact?.phone || "")}
                isEditing={editMode === "contact.phone"}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
                style={{ color: "#ffffff" }}
              />
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <EditableField
                value={data.contact?.email || ""}
                onEdit={() => onEdit("contact.email", data.contact?.email || "")}
                isEditing={editMode === "contact.email"}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
                style={{ color: "#ffffff" }}
              />
            </div>
            <div className="contact-item">
              <span className="contact-icon">🔗</span>
              <EditableField
                value={data.contact?.linkedin || ""}
                onEdit={() => onEdit("contact.linkedin", data.contact?.linkedin || "")}
                isEditing={editMode === "contact.linkedin"}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
                style={{ color: "#ffffff" }}
              />
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Skills</h3>
          <div className="sidebar-content">
            <div className="skills-container">
              {Array.isArray(data.skills) && data.skills.map((skillItem, index) => {
                // Check if the skill item has category and items properties
                if (skillItem && typeof skillItem === 'object' && 'category' in skillItem && 'items' in skillItem) {
                  return (
                    <div key={index} className="skill-category" style={{ marginBottom: '16px' }}>
                      <div className="skill-category-name" style={{ color: "#ffffff", fontWeight: 'bold', marginBottom: '8px' }}>
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
                          style={{ color: "#ffffff" }}
                        />
                      </div>
                      <div className="skill-items" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                              style={{ color: "#ffffff" }}
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
                        style={{ color: "#ffffff" }}
                      />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="resume-main">
        <div className="resume-header">
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
            style={{ color: colors.primary }}
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
          />
        </div>

        {renderSections()}
      </div>
    </div>
  )
}

export default CreativeTemplate
