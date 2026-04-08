import { useState } from "react";

const initialFormState = {
  title: "",
  originalUrl: "",
  startTime: "",
  endTime: "",
};

function LinkForm({ onCreateLink }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");

    if (formData.startTime && formData.endTime && formData.startTime > formData.endTime) {
      setFeedback("End time must be later than start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateLink({
        title: formData.title.trim(),
        originalUrl: formData.originalUrl.trim(),
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
      });

      setFormData(initialFormState);
    } catch (error) {
      setFeedback(error.message || "Unable to create the short link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="link-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label className="field">
          <span>Title</span>
          <input
            name="title"
            onChange={handleChange}
            placeholder="Campaign landing page"
            required
            type="text"
            value={formData.title}
          />
        </label>

        <label className="field field--wide">
          <span>Original URL</span>
          <input
            name="originalUrl"
            onChange={handleChange}
            placeholder="https://example.com"
            required
            type="url"
            value={formData.originalUrl}
          />
        </label>

        <label className="field">
          <span>Start time</span>
          <input
            name="startTime"
            onChange={handleChange}
            type="datetime-local"
            value={formData.startTime}
          />
        </label>

        <label className="field">
          <span>End time</span>
          <input
            name="endTime"
            onChange={handleChange}
            type="datetime-local"
            value={formData.endTime}
          />
        </label>
      </div>

      {feedback ? <p className="form-feedback form-feedback--error">{feedback}</p> : null}

      <button className="button button--primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating..." : "Create Short URL"}
      </button>
    </form>
  );
}

export default LinkForm;
