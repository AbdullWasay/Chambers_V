import EditableField from "../EditableField"

const ElegantTemplate = ({ data, designSettings, onEdit, editMode, editValue, setEditValue, onSave, onCancel }) => {
  const { colors } = designSettings

  return (
    <div className="resume-template elegant-template">
      <div className="resume-header" style={{ borderBottom: `1px solid ${colors.primary}` }}>
        <div className="resume-name-title">
          <EditableField
            value={data.name}
            onEdit={() => onEdit("name", data.name)}
            isEditing={editMode === "name"}
            editValue={editValue}
            setEditValue={setEditValue}
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
            setEditValue={setEditValue}
            onSave={onSave}
            onCancel={onCancel}
            className="resume-title"
          />
        </div>
        <div className="resume-contact">
          <div className="contact-item">
            <span className="contact-icon">📱</span>
            <EditableField
              value={data.contact.phone}
              onEdit={() => onEdit("contact.phone", data.contact.phone)}
              isEditing={editMode === "contact.phone"}
              editValue={editValue}
              setEditValue={setEditValue}
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
              setEditValue={setEditValue}
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
              setEditValue={setEditValue}
              onSave={onSave}
              onCancel={onCancel}
            />
          </div>
        </div>
      </div>

      <div className="resume-body">
        <div className="resume-section">
          <h2 className="section-title" style={{ color: colors.primary, borderBottom: `1px solid ${colors.primary}` }}>
            Summary
          </h2>
          <EditableField
            value={data.summary}
            onEdit={() => onEdit("summary", data.summary)}
            isEditing={editMode === "summary"}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={onSave}
            onCancel={onCancel}
            multiline={true}
          />
        </div>

        <div className="resume-section">
          <h2 className="section-title" style={{ color: colors.primary, borderBottom: `1px solid ${colors.primary}` }}>
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <EditableField
                  value={exp.title}
                  onEdit={() => onEdit(`experience.${index}.title`, exp.title)}
                  isEditing={editMode === `experience.${index}.title`}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSave={onSave}
                  onCancel={onCancel}
                  className="experience-title"
                  style={{ color: colors.primary }}
                />
                <div className="experience-company-location">
                  <EditableField
                    value={exp.company}
                    onEdit={() => onEdit(`experience.${index}.company`, exp.company)}
                    isEditing={editMode === `experience.${index}.company`}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="experience-company"
                  />
                  <span className="separator">|</span>
                  <EditableField
                    value={exp.location}
                    onEdit={() => onEdit(`experience.${index}.location`, exp.location)}
                    isEditing={editMode === `experience.${index}.location`}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="experience-location"
                  />
                </div>
                <EditableField
                  value={exp.period}
                  onEdit={() => onEdit(`experience.${index}.period`, exp.period)}
                  isEditing={editMode === `experience.${index}.period`}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSave={onSave}
                  onCancel={onCancel}
                  className="experience-period"
                />
              </div>
              <ul className="experience-bullets">
                {exp.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>
                    <EditableField
                      value={bullet}
                      onEdit={() => onEdit(`experience.${index}.bullets.${bulletIndex}`, bullet)}
                      isEditing={editMode === `experience.${index}.bullets.${bulletIndex}`}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      onSave={onSave}
                      onCancel={onCancel}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="resume-section">
          <h2 className="section-title" style={{ color: colors.primary, borderBottom: `1px solid ${colors.primary}` }}>
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <EditableField
                  value={edu.degree}
                  onEdit={() => onEdit(`education.${index}.degree`, edu.degree)}
                  isEditing={editMode === `education.${index}.degree`}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSave={onSave}
                  onCancel={onCancel}
                  className="education-degree"
                  style={{ color: colors.primary }}
                />
                <div className="education-school-location">
                  <EditableField
                    value={edu.school}
                    onEdit={() => onEdit(`education.${index}.school`, edu.school)}
                    isEditing={editMode === `education.${index}.school`}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="education-school"
                  />
                  <span className="separator">|</span>
                  <EditableField
                    value={edu.location}
                    onEdit={() => onEdit(`education.${index}.location`, edu.location)}
                    isEditing={editMode === `education.${index}.location`}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onSave={onSave}
                    onCancel={onCancel}
                    className="education-location"
                  />
                </div>
                <EditableField
                  value={edu.year}
                  onEdit={() => onEdit(`education.${index}.year`, edu.year)}
                  isEditing={editMode === `education.${index}.year`}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSave={onSave}
                  onCancel={onCancel}
                  className="education-year"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="resume-section">
          <h2 className="section-title" style={{ color: colors.primary, borderBottom: `1px solid ${colors.primary}` }}>
            Skills
          </h2>
          <div className="skills-container">
            {data.skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <EditableField
                  value={skill}
                  onEdit={() => onEdit(`skills.${index}`, skill)}
                  isEditing={editMode === `skills.${index}`}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSave={onSave}
                  onCancel={onCancel}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElegantTemplate
