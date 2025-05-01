"use client"

import EditableField from "../EditableField"
import SectionControls from "../SectionControls"

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
}) => {
  const { colors } = designSettings

  // Helper function to render sections in the correct order
  const renderSections = () => {
    return sectionOrder.map((section) => {
      const sectionId = section.id
      const sectionData = data[sectionId]

      if (!sectionData) return null

      const isHovered = hoveredSection === sectionId

      const sectionContent = (() => {
        switch (sectionId) {
          case "summary":
            return (
              <EditableField
                value={data.summary}
                onEdit={() => onEdit("summary", data.summary)}
                isEditing={editMode === "summary"}
                editValue={editValue}
                editFormatting={editFormatting}
                setEditValue={setEditValue}
                setEditFormatting={setEditFormatting}
                onSave={onSave}
                onCancel={onCancel}
                multiline={true}
              />
            )
          case "experience":
            return (
              Array.isArray(sectionData) &&
              sectionData.map((exp, index) => (
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
                        value={exp.period}
                        onEdit={() => onEdit(`experience.${index}.period`, exp.period)}
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
                  <ul className="experience-bullets">
                    {exp.bullets &&
                      exp.bullets.map((bullet, bulletIndex) => (
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
              ))
            )
          case "education":
            return (
              Array.isArray(sectionData) &&
              sectionData.map((edu, index) => (
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
                        value={edu.year}
                        onEdit={() => onEdit(`education.${index}.year`, edu.year)}
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
                </div>
              ))
            )
          case "skills":
            return (
              <div className="skills-container">
                {Array.isArray(sectionData) &&
                  sectionData.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <EditableField
                        value={skill}
                        onEdit={() => onEdit(`skills.${index}`, skill)}
                        isEditing={editMode === `skills.${index}`}
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
            )
          case "projects":
            return (
              Array.isArray(sectionData) &&
              sectionData.map((project, index) => (
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
                    {project.technologies &&
                      project.technologies.map((tech, techIndex) => (
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
              ))
            )
          case "certifications":
            return (
              Array.isArray(sectionData) &&
              sectionData.map((cert, index) => (
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
              ))
            )
          case "languages":
            return (
              Array.isArray(sectionData) &&
              sectionData.map((lang, index) => (
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
              ))
            )
          case "interests":
            return (
              <div className="interests-container">
                {Array.isArray(sectionData) &&
                  sectionData.map((interest, index) => (
                    <div key={index} className="interest-item">
                      <EditableField
                        value={interest}
                        onEdit={() => onEdit(`interests.${index}`, interest)}
                        isEditing={editMode === `interests.${index}`}
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
            )
          case "references":
            return (
              Array.isArray(sectionData) &&
              sectionData.map((ref, index) => (
                <div key={index} className="reference-item">
                  <EditableField
                    value={ref.name}
                    onEdit={() => onEdit(`references.${index}.name`, ref.name)}
                    isEditing={editMode === `references.${index}.name`}
                    editValue={editValue}
                    editFormatting={editFormatting}
                    setEditValue={setEditValue}
                    setEditFormatting={setEditFormatting}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="reference-name"
                    style={{ color: colors.primary }}
                  />
                  <div className="reference-details">
                    <EditableField
                      value={ref.position}
                      onEdit={() => onEdit(`references.${index}.position`, ref.position)}
                      isEditing={editMode === `references.${index}.position`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="reference-position"
                    />
                    <EditableField
                      value={ref.company}
                      onEdit={() => onEdit(`references.${index}.company`, ref.company)}
                      isEditing={editMode === `references.${index}.company`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="reference-company"
                    />
                    <EditableField
                      value={ref.contact}
                      onEdit={() => onEdit(`references.${index}.contact`, ref.contact)}
                      isEditing={editMode === `references.${index}.contact`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                      className="reference-contact"
                    />
                  </div>
                </div>
              ))
            )
          default:
            // Handle custom sections
            if (Array.isArray(sectionData)) {
              return sectionData.map((item, index) => (
                <div key={index} className="custom-item">
                  {typeof item === "string" ? (
                    <EditableField
                      value={item}
                      onEdit={() => onEdit(`${sectionId}.${index}`, item)}
                      isEditing={editMode === `${sectionId}.${index}`}
                      editValue={editValue}
                      editFormatting={editFormatting}
                      setEditValue={setEditValue}
                      setEditFormatting={setEditFormatting}
                      onSave={onSave}
                      onCancel={onCancel}
                    />
                  ) : (
                    <div className="custom-item-object">
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="custom-item-field">
                          <EditableField
                            value={value}
                            onEdit={() => onEdit(`${sectionId}.${index}.${key}`, value)}
                            isEditing={editMode === `${sectionId}.${index}.${key}`}
                            editValue={editValue}
                            editFormatting={editFormatting}
                            setEditValue={setEditValue}
                            setEditFormatting={setEditFormatting}
                            onSave={onSave}
                            onCancel={onCancel}
                            className={key === "title" ? "custom-item-title" : ""}
                            style={key === "title" ? { color: colors.primary } : {}}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            }
            return (
              <div className="custom-content">
                <EditableField
                  value={sectionData}
                  onEdit={() => onEdit(sectionId, sectionData)}
                  isEditing={editMode === sectionId}
                  editValue={editValue}
                  editFormatting={editFormatting}
                  setEditValue={setEditValue}
                  setEditFormatting={setEditFormatting}
                  onSave={onSave}
                  onCancel={onCancel}
                  multiline={true}
                />
              </div>
            )
        }
      })()

      return (
        <div
          key={sectionId}
          className="resume-section"
          onMouseEnter={() => onSectionHover(sectionId, true)}
          onMouseLeave={() => onSectionHover(sectionId, false)}
        >
          <div className="section-header">
            <h2 className="section-title" style={{ color: colors.primary }}>
              {section.title.toUpperCase()}
            </h2>
            {isHovered && (
              <SectionControls
                sectionId={sectionId}
                onDelete={() => onDeleteSection(sectionId)}
                onMoveUp={() => onMoveSection(sectionId, "up")}
                onMoveDown={() => onMoveSection(sectionId, "down")}
              />
            )}
          </div>
          {sectionContent}
        </div>
      )
    })
  }

  return (
    <div className="resume-template modern-template">
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
          <div className="resume-photo">
            {data.photo ? (
              <img src={data.photo || "/placeholder.svg"} alt={data.name} />
            ) : (
              <div className="photo-placeholder" style={{ backgroundColor: colors.primary }}>
                {data.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </div>
            )}
          </div>
        </div>
        <div className="resume-contact">
          <div className="contact-item">
            <span className="contact-icon">📱</span>
            <EditableField
              value={data.contact.phone}
              onEdit={() => onEdit("contact.phone", data.contact.phone)}
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
              value={data.contact.email}
              onEdit={() => onEdit("contact.email", data.contact.email)}
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
              value={data.contact.linkedin}
              onEdit={() => onEdit("contact.linkedin", data.contact.linkedin)}
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
      </div>

      <div className="resume-body">{renderSections()}</div>
    </div>
  )
}

export default ModernTemplate
