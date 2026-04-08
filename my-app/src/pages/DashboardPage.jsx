import LinkForm from "../components/LinkForm";
import LinkList from "../components/LinkList";

function DashboardPage({
  busyLinkId,
  links,
  linksError,
  linksLoading,
  onCreateLink,
  onDeleteLink,
  onLogout,
  onToggleLink,
  session,
}) {
  const activeLinks = links.filter((link) => link.isActive).length;

  return (
    <section className="dashboard-layout">
      <header className="panel hero-panel">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Manage short URLs without clutter</h1>
          <p className="lead-text">
            Signed in as <strong>{session.user.email}</strong>. Create links, control
            their schedule, and share reliable short URLs.
          </p>
        </div>

        <div className="hero-panel__actions">
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total links</span>
              <strong>{links.length}</strong>
            </article>
            <article className="stat-card">
              <span>Active now</span>
              <strong>{activeLinks}</strong>
            </article>
          </div>

          <button className="button button--ghost" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Create Link</p>
            <h2>Add a new short URL</h2>
          </div>
          <p className="muted-text">
            Title and original URL are required. Start and end times are optional.
          </p>
        </div>

        <LinkForm onCreateLink={onCreateLink} />
      </section>

      <LinkList
        busyLinkId={busyLinkId}
        links={links}
        linksError={linksError}
        linksLoading={linksLoading}
        onDeleteLink={onDeleteLink}
        onToggleLink={onToggleLink}
      />
    </section>
  );
}

export default DashboardPage;
