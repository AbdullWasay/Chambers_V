"use client"

import "../../styles/ModernTemplate.css";
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
  getSectionsForPage = null,
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
          sectionContent = (
            <>
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
              ))}
            </>
          );
          break;

        case "education":
          sectionContent = (
            <div className="education-section">
              {Array.isArray(sectionData) && sectionData.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <div className="education-title-company">
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
                    <div className="education-location-period">
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
                        className="education-period"
                      />
                    </div>
                  </div>
                  <div className="education-location">
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

        // Add support for publications section
        case "publications":
          sectionContent = (
            <div className="publications-section">
              {Array.isArray(sectionData) && sectionData.map((publication, index) => (
                <div key={index} className="publication-item">
                  <div className="publication-header">
                    <EditableField
                      value={publication.name || publication.title || ''}
                      onEdit={() => onEdit(`publications.${index}.name`, publication.name || publication.title || '')}
                      isEditing={editMode === `publications.${index}.name`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="publication-name"
                      style={{ color: colors.primary }}
                    />
                    <EditableField
                      value={publication.date || publication.releaseDate || ''}
                      onEdit={() => onEdit(`publications.${index}.date`, publication.date || publication.releaseDate || '')}
                      isEditing={editMode === `publications.${index}.date`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="publication-date"
                    />
                  </div>
                  <EditableField
                    value={publication.publisher || ''}
                    onEdit={() => onEdit(`publications.${index}.publisher`, publication.publisher || '')}
                    isEditing={editMode === `publications.${index}.publisher`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="publication-publisher"
                  />
                  <EditableField
                    value={publication.summary || publication.description || ''}
                    onEdit={() => onEdit(`publications.${index}.summary`, publication.summary || publication.description || '')}
                    isEditing={editMode === `publications.${index}.summary`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="publication-summary"
                    multiline={true}
                  />
                </div>
              ))}
            </div>
          );
          break;

        // Add support for volunteer section
        case "volunteer":
          sectionContent = (
            <div className="volunteer-section">
              {Array.isArray(sectionData) && sectionData.map((volunteer, index) => (
                <div key={index} className="volunteer-item">
                  <div className="volunteer-header">
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
                  <div className="volunteer-dates">
                    <EditableField
                      value={`${formatDate(volunteer.startDate || '')} - ${formatDate(volunteer.endDate || 'Present')}`}
                      onEdit={() => onEdit(`volunteer.${index}.dates`, `${formatDate(volunteer.startDate || '')} - ${formatDate(volunteer.endDate || 'Present')}`)}
                      isEditing={editMode === `volunteer.${index}.dates`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="volunteer-dates"
                    />
                  </div>
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
                    className="volunteer-summary"
                    multiline={true}
                  />
                </div>
              ))}
            </div>
          );
          break;

        // Add support for interests section
        case "interests":
          sectionContent = (
            <div className="interests-section">
              {Array.isArray(sectionData) && sectionData.map((interest, index) => (
                <div key={index} className="interest-item">
                  <EditableField
                    value={interest.name || (typeof interest === 'string' ? interest : '')}
                    onEdit={() => onEdit(`interests.${index}.name`, interest.name || (typeof interest === 'string' ? interest : ''))}
                    isEditing={editMode === `interests.${index}.name`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="interest-name"
                    style={{ color: colors.primary }}
                  />
                  {interest.keywords && Array.isArray(interest.keywords) && (
                    <div className="interest-keywords">
                      {interest.keywords.map((keyword, keywordIndex) => (
                        <span key={keywordIndex} className="interest-keyword">
                          <EditableField
                            value={keyword}
                            onEdit={() => onEdit(`interests.${index}.keywords.${keywordIndex}`, keyword)}
                            isEditing={editMode === `interests.${index}.keywords.${keywordIndex}`}
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
          );
          break;

        // Add support for awards section (alternative to achievements)
        case "awards":
          sectionContent = (
            <div className="awards-section">
              {Array.isArray(sectionData) && sectionData.map((award, index) => (
                <div key={index} className="award-item">
                  <div className="award-header">
                    <EditableField
                      value={award.title || award.name || ''}
                      onEdit={() => onEdit(`awards.${index}.title`, award.title || award.name || '')}
                      isEditing={editMode === `awards.${index}.title`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="award-title"
                      style={{ color: colors.primary }}
                    />
                    <EditableField
                      value={award.date || ''}
                      onEdit={() => onEdit(`awards.${index}.date`, award.date || '')}
                      isEditing={editMode === `awards.${index}.date`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="award-date"
                    />
                  </div>
                  <EditableField
                    value={award.awarder || award.organization || ''}
                    onEdit={() => onEdit(`awards.${index}.awarder`, award.awarder || award.organization || '')}
                    isEditing={editMode === `awards.${index}.awarder`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="award-awarder"
                  />
                  <EditableField
                    value={award.summary || award.description || ''}
                    onEdit={() => onEdit(`awards.${index}.summary`, award.summary || award.description || '')}
                    isEditing={editMode === `awards.${index}.summary`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    multiline={true}
                    className="award-summary"
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

      // Add CSS classes for sections that continue across pages
      const sectionClasses = [
        'resume-section',
        isHovered ? 'hovered' : '',
        continuesFromPrevious ? 'continues-from-previous' : '',
        continuesToNext ? 'continues-to-next' : ''
      ].filter(Boolean).join(' ');

      // Add continuation indicators for sections that span multiple pages
      const continuationIndicator = () => {
        if (continuesFromPrevious && continuesToNext) {
          return <div className="continuation-indicator both">Continued from previous page and to next page</div>;
        } else if (continuesFromPrevious) {
          return <div className="continuation-indicator from-previous">Continued from previous page</div>;
        } else if (continuesToNext) {
          return <div className="continuation-indicator to-next">Continues on next page</div>;
        }
        return null;
      };

      return (
        <div
          key={sectionId}
          className={sectionClasses}
          onMouseEnter={() => onSectionHover(sectionId, true)}
          onMouseLeave={() => onSectionHover(sectionId, false)}
        >
          {/* Only show section header if this is the first occurrence of the section or if it's not continuing from a previous page */}
          {!continuesFromPrevious && (
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
          )}

          {/* Show continuation indicator at the top if needed */}
          {continuesFromPrevious && continuationIndicator()}

          {sectionContent}

          {/* Show continuation indicator at the bottom if needed */}
          {continuesToNext && !continuesFromPrevious && continuationIndicator()}
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
                value={data.basics ? data.basics.name : data.name}
                onEdit={() => onEdit(data.basics ? "basics.name" : "name", data.basics ? data.basics.name : data.name)}
                isEditing={editMode === (data.basics ? "basics.name" : "name")}
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
                value={data.basics ? data.basics.label : data.title}
                onEdit={() => onEdit(data.basics ? "basics.label" : "title", data.basics ? data.basics.label : data.title)}
                isEditing={editMode === (data.basics ? "basics.label" : "title")}
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
            {/* Email */}
            <div className="resume-contact-item">
              <span className="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <EditableField
                value={(data.basics && data.basics.email) || data.email || "email@example.com"}
                onEdit={() => onEdit(data.basics ? "basics.email" : "email", (data.basics && data.basics.email) || data.email || "email@example.com")}
                isEditing={editMode === (data.basics ? "basics.email" : "email")}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
              />
            </div>

            {/* Phone */}
            <div className="resume-contact-item">
              <span className="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
              <EditableField
                value={(data.basics && data.basics.phone) || data.phone || "(123) 456-7890"}
                onEdit={() => onEdit(data.basics ? "basics.phone" : "phone", (data.basics && data.basics.phone) || data.phone || "(123) 456-7890")}
                isEditing={editMode === (data.basics ? "basics.phone" : "phone")}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
              />
            </div>

            {/* Location */}
            <div className="resume-contact-item">
              <span className="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <EditableField
                value={
                  (data.basics && data.basics.location && data.basics.location.city)
                    ? `${data.basics.location.city}${data.basics.location.region ? `, ${data.basics.location.region}` : ''}`
                    : data.location || "City, State"
                }
                onEdit={() => onEdit(
                  data.basics ? "basics.location" : "location",
                  (data.basics && data.basics.location && data.basics.location.city)
                    ? `${data.basics.location.city}${data.basics.location.region ? `, ${data.basics.location.region}` : ''}`
                    : data.location || "City, State"
                )}
                isEditing={editMode === (data.basics ? "basics.location" : "location")}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
              />
            </div>

            {/* Website */}
            <div className="resume-contact-item">
              <span className="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </span>
              <EditableField
                value={(data.basics && data.basics.url) || data.website || "website.com"}
                onEdit={() => onEdit(data.basics ? "basics.url" : "website", (data.basics && data.basics.url) || data.website || "website.com")}
                isEditing={editMode === (data.basics ? "basics.url" : "website")}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
              />
            </div>
          </div>
        </div>
      )}
      {renderSections()}
    </div>
  );
};

export default ModernTemplate;
