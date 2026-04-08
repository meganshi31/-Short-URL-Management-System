import { startTransition, useEffect, useState } from "react";

import "./App.css";
import {
  createLink,
  deleteLink,
  fetchCurrentUser,
  fetchLinks,
  loginUser,
  logoutUser,
  registerUser,
  toggleLinkStatus,
} from "./api/client";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

const SESSION_STORAGE_KEY = "short-url-session";

function readStoredSession() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function storeSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function App() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState("");
  const [busyLinkId, setBusyLinkId] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      const storedSession = readStoredSession();

      if (!storedSession?.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const { user } = await fetchCurrentUser(storedSession.token);

        if (ignore) {
          return;
        }

        const restoredSession = {
          token: storedSession.token,
          user,
        };

        setSession(restoredSession);
        storeSession(restoredSession);
        await loadLinks(storedSession.token, ignore);
      } catch (error) {
        if (ignore) {
          return;
        }

        clearStoredSession();
        setAuthError(error.message || "Your session expired. Please log in again.");
      } finally {
        if (!ignore) {
          setIsBootstrapping(false);
        }
      }
    }

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  async function loadLinks(token, ignore = false) {
    setLinksLoading(true);
    setLinksError("");

    try {
      const response = await fetchLinks(token);

      if (ignore) {
        return;
      }

      setLinks(response.links);
    } catch (error) {
      if (!ignore) {
        setLinksError(error.message || "Unable to load your links.");
      }
    } finally {
      if (!ignore) {
        setLinksLoading(false);
      }
    }
  }

  function resetSessionState() {
    clearStoredSession();
    setSession(null);
    setLinks([]);
    setLinksError("");
    setBusyLinkId("");
  }

  async function handleAuthSubmit(credentials) {
    setAuthLoading(true);
    setAuthError("");

    try {
      const response =
        authMode === "login"
          ? await loginUser(credentials)
          : await registerUser(credentials);

      const nextSession = {
        token: response.token,
        user: response.user,
      };

      setSession(nextSession);
      storeSession(nextSession);
      await loadLinks(response.token);
      setToastMessage(response.message);
    } catch (error) {
      setAuthError(error.message || "Unable to continue with authentication.");
    } finally {
      setAuthLoading(false);
      setIsBootstrapping(false);
    }
  }

  async function handleLogout() {
    const token = session?.token;

    try {
      if (token) {
        await logoutUser(token);
      }
    } finally {
      resetSessionState();
      setToastMessage("You have been logged out.");
    }
  }

  async function handleCreateLink(linkData) {
    try {
      const response = await createLink(session.token, linkData);

      startTransition(() => {
        setLinks((currentLinks) => [response.link, ...currentLinks]);
      });

      setToastMessage(response.message);
      return response.link;
    } catch (error) {
      if (error.status === 401) {
        resetSessionState();
      }

      throw error;
    }
  }

  async function handleToggleLink(linkId) {
    setBusyLinkId(linkId);

    try {
      const response = await toggleLinkStatus(session.token, linkId);

      startTransition(() => {
        setLinks((currentLinks) =>
          currentLinks.map((link) => (link.id === linkId ? response.link : link)),
        );
      });

      setToastMessage(response.message);
    } catch (error) {
      if (error.status === 401) {
        resetSessionState();
      } else {
        setLinksError(error.message || "Unable to update this link.");
      }
    } finally {
      setBusyLinkId("");
    }
  }

  async function handleDeleteLink(linkId) {
    setBusyLinkId(linkId);

    try {
      const response = await deleteLink(session.token, linkId);

      startTransition(() => {
        setLinks((currentLinks) => currentLinks.filter((link) => link.id !== linkId));
      });

      setToastMessage(response.message);
    } catch (error) {
      if (error.status === 401) {
        resetSessionState();
      } else {
        setLinksError(error.message || "Unable to delete this link.");
      }
    } finally {
      setBusyLinkId("");
    }
  }

  if (isBootstrapping) {
    return (
      <main className="app-shell">
        <section className="panel panel--centered">
          <p className="eyebrow">Short URL Manager</p>
          <h1>Preparing your workspace</h1>
          <p className="muted-text">Restoring your session and fetching your links.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      {toastMessage ? <div className="toast">{toastMessage}</div> : null}
      {session ? (
        <DashboardPage
          busyLinkId={busyLinkId}
          links={links}
          linksError={linksError}
          linksLoading={linksLoading}
          onCreateLink={handleCreateLink}
          onDeleteLink={handleDeleteLink}
          onLogout={handleLogout}
          onToggleLink={handleToggleLink}
          session={session}
        />
      ) : (
        <AuthPage
          authError={authError}
          authLoading={authLoading}
          authMode={authMode}
          onModeChange={setAuthMode}
          onSubmit={handleAuthSubmit}
        />
      )}
    </main>
  );
}

export default App;
