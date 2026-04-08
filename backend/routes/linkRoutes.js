const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createLink,
  deleteLinkByIdAndUserId,
  existsShortCode,
  listLinksByUserId,
  toggleLinkByIdAndUserId,
} = require("../storage/repository");
const generateShortCode = require("../utils/generateShortCode");

router.use(authMiddleware);

function buildShortUrl(req, shortCode) {
  return `${req.protocol}://${req.get("host")}/${shortCode}`;
}

function mapLink(req, link) {
  return {
    id: link._id,
    title: link.title,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    shortUrl: buildShortUrl(req, link.shortCode),
    isActive: link.isActive,
    startTime: link.startTime,
    endTime: link.endTime,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
}

function parseOptionalDate(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "invalid";
  }

  return parsedDate;
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

async function createUniqueShortCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const shortCode = generateShortCode();
    const existingLink = await existsShortCode(shortCode);

    if (!existingLink) {
      return shortCode;
    }
  }

  const error = new Error("Unable to generate a unique short code.");
  error.statusCode = 500;
  throw error;
}

router.get("/", async (req, res, next) => {
  try {
    const links = await listLinksByUserId(req.user.id);

    res.json({
      links: links.map((link) => mapLink(req, link)),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    const originalUrl = req.body.originalUrl?.trim();
    const startTime = parseOptionalDate(req.body.startTime);
    const endTime = parseOptionalDate(req.body.endTime);

    if (!title || !originalUrl) {
      return res
        .status(400)
        .json({ message: "Title and original URL are required." });
    }

    if (!isValidHttpUrl(originalUrl)) {
      return res
        .status(400)
        .json({ message: "Original URL must be a valid http or https URL." });
    }

    if (startTime === "invalid" || endTime === "invalid") {
      return res
        .status(400)
        .json({ message: "Start time or end time is invalid." });
    }

    if (startTime && endTime && startTime > endTime) {
      return res
        .status(400)
        .json({ message: "End time must be later than start time." });
    }

    const link = await createLink({
      userId: req.user.id,
      title,
      originalUrl,
      shortCode: await createUniqueShortCode(),
      startTime,
      endTime,
    });

    return res.status(201).json({
      message: "Short link created successfully.",
      link: mapLink(req, link),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Short code conflict. Please retry." });
    }

    return next(error);
  }
});

router.patch("/:id/toggle", async (req, res, next) => {
  try {
    const link = await toggleLinkByIdAndUserId(req.params.id, req.user.id);

    if (!link) {
      return res.status(404).json({ message: "Link not found." });
    }

    return res.json({
      message: `Link ${link.isActive ? "activated" : "deactivated"} successfully.`,
      link: mapLink(req, link),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid link id." });
    }

    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deletedLink = await deleteLinkByIdAndUserId(req.params.id, req.user.id);

    if (!deletedLink) {
      return res.status(404).json({ message: "Link not found." });
    }

    return res.json({ message: "Link deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid link id." });
    }

    return next(error);
  }
});

module.exports = router;
