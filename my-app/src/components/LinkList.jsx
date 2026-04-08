import { useState } from "react";

function formatDate(dateString) {
  if (!dateString) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function getStatus(link) {
  const now = Date.now();
  const startTime = link.startTime ? new Date(link.startTime).getTime() : null;
  const endTime = link.endTime ? new Date(link.endTime).getTime() : null;

  if (!link.isActive) {
    return {
      label: "Inactive",
      tone: "neutral",
      detail: "Paused manually",
    };
  }

  if (startTime && now < startTime) {
    return {
      label: "Scheduled",
      tone: "pending",
      detail: `Starts ${formatDate(link.startTime)}`,
    };
  }

  if (endTime && now > endTime) {
    return {
      label: "Expired",
      tone: "danger",
      detail: `Ended ${formatDate(link.endTime)}`,
    };
  }

  return {
    label: "Live",
    tone: "success",
    detail: endTime ? `Ends ${formatDate(link.endTime)}` : "No expiry window",
  };
}

function LinkList({
  busyLinkId,
  links,
  linksError,
  linksLoading,
  onDeleteLink,
  onToggleLink,
}) {
  const [copiedId, setCopiedId] = useState("");

  async function handleCopy(link) {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopiedId(link.id);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch {
      setCopiedId("");
    }
  }

  if (linksLoading) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your Links</p>
            <h2>Loading saved links</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your Links</p>
          <h2>Manage every short URL in one place</h2>
        </div>
        <p className="muted-text">{links.length} total links</p>
      </div>

      {linksError ? <p className="form-feedback form-feedback--error">{linksError}</p> : null}

      {links.length === 0 ? (
        <div className="empty-state">
          <h3>No links yet</h3>
          <p>Create your first short URL using the form above.</p>
        </div>
      ) : (
        <div className="link-list">
          {links.map((link) => {
            const status = getStatus(link);
            const isBusy = busyLinkId === link.id;

            return (
              <article className="link-card" key={link.id}>
                <div className="link-card__header">
                  <div>
                    <h3>{link.title}</h3>
                    <a href={link.originalUrl} rel="noreferrer" target="_blank">
                      {link.originalUrl}
                    </a>
                  </div>
                  <span className={`status-pill status-pill--${status.tone}`}>
                    {status.label}
                  </span>
                </div>

                <div className="link-card__meta">
                  <p>
                    <strong>Short URL:</strong>{" "}
                    <a href={link.shortUrl} rel="noreferrer" target="_blank">
                      {link.shortCode}
                    </a>
                  </p>
                  <p>
                    <strong>Window:</strong> {status.detail}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDate(link.createdAt)}
                  </p>
                </div>

                <div className="link-card__actions">
                  <button
                    className="button button--ghost"
                    onClick={() => handleCopy(link)}
                    type="button"
                  >
                    {copiedId === link.id ? "Copied" : "Copy"}
                  </button>

                  <button
                    className="button button--ghost"
                    disabled={isBusy}
                    onClick={() => onToggleLink(link.id)}
                    type="button"
                  >
                    {isBusy
                      ? "Saving..."
                      : link.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>

                  <button
                    className="button button--danger"
                    disabled={isBusy}
                    onClick={() => onDeleteLink(link.id)}
                    type="button"
                  >
                    {isBusy ? "Working..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default LinkList;
