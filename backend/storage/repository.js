const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const Link = require("../models/Link");
const User = require("../models/User");

const DATA_DIRECTORY = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "db.json");

function isFileDbEnabled() {
  return process.env.USE_FILE_DB === "true";
}

async function ensureFileDatabase() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify({ users: [], links: [] }, null, 2),
      "utf8",
    );
  }
}

async function readFileDatabase() {
  await ensureFileDatabase();
  const content = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(content);
}

async function writeFileDatabase(data) {
  await ensureFileDatabase();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  if (typeof user.toObject === "function") {
    const object = user.toObject();

    return {
      id: object._id.toString(),
      email: object.email,
      password: object.password,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
    };
  }

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function normalizeLink(link) {
  if (!link) {
    return null;
  }

  if (typeof link.toObject === "function") {
    const object = link.toObject();

    return {
      id: object._id.toString(),
      userId: object.userId.toString(),
      title: object.title,
      originalUrl: object.originalUrl,
      shortCode: object.shortCode,
      isActive: object.isActive,
      startTime: object.startTime,
      endTime: object.endTime,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
    };
  }

  return {
    id: link.id,
    userId: link.userId,
    title: link.title,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    isActive: link.isActive,
    startTime: link.startTime,
    endTime: link.endTime,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
}

function createTimestamp() {
  return new Date().toISOString();
}

function createId() {
  return crypto.randomUUID();
}

async function findUserByEmail(email) {
  if (!isFileDbEnabled()) {
    return normalizeUser(await User.findOne({ email }));
  }

  const data = await readFileDatabase();
  return normalizeUser(data.users.find((user) => user.email === email));
}

async function findUserById(id) {
  if (!isFileDbEnabled()) {
    return normalizeUser(await User.findById(id));
  }

  const data = await readFileDatabase();
  return normalizeUser(data.users.find((user) => user.id === id));
}

async function createUser({ email, password }) {
  if (!isFileDbEnabled()) {
    return normalizeUser(
      await User.create({
        email,
        password,
      }),
    );
  }

  const data = await readFileDatabase();
  const now = createTimestamp();

  const user = {
    id: createId(),
    email,
    password,
    createdAt: now,
    updatedAt: now,
  };

  data.users.push(user);
  await writeFileDatabase(data);

  return normalizeUser(user);
}

async function listLinksByUserId(userId) {
  if (!isFileDbEnabled()) {
    const links = await Link.find({ userId }).sort({ createdAt: -1 });
    return links.map(normalizeLink);
  }

  const data = await readFileDatabase();

  return data.links
    .filter((link) => link.userId === userId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map(normalizeLink);
}

async function existsShortCode(shortCode) {
  if (!isFileDbEnabled()) {
    return Boolean(await Link.exists({ shortCode }));
  }

  const data = await readFileDatabase();
  return data.links.some((link) => link.shortCode === shortCode);
}

async function createLink(linkInput) {
  if (!isFileDbEnabled()) {
    return normalizeLink(await Link.create(linkInput));
  }

  const data = await readFileDatabase();
  const now = createTimestamp();

  const link = {
    id: createId(),
    userId: linkInput.userId,
    title: linkInput.title,
    originalUrl: linkInput.originalUrl,
    shortCode: linkInput.shortCode,
    isActive: linkInput.isActive ?? true,
    startTime: linkInput.startTime || null,
    endTime: linkInput.endTime || null,
    createdAt: now,
    updatedAt: now,
  };

  data.links.push(link);
  await writeFileDatabase(data);

  return normalizeLink(link);
}

async function findLinkByShortCode(shortCode) {
  if (!isFileDbEnabled()) {
    return normalizeLink(await Link.findOne({ shortCode }));
  }

  const data = await readFileDatabase();
  return normalizeLink(data.links.find((link) => link.shortCode === shortCode));
}

async function toggleLinkByIdAndUserId(id, userId) {
  if (!isFileDbEnabled()) {
    const link = await Link.findOne({ _id: id, userId });

    if (!link) {
      return null;
    }

    link.isActive = !link.isActive;
    await link.save();
    return normalizeLink(link);
  }

  const data = await readFileDatabase();
  const linkIndex = data.links.findIndex(
    (link) => link.id === id && link.userId === userId,
  );

  if (linkIndex === -1) {
    return null;
  }

  const updatedLink = {
    ...data.links[linkIndex],
    isActive: !data.links[linkIndex].isActive,
    updatedAt: createTimestamp(),
  };

  data.links[linkIndex] = updatedLink;
  await writeFileDatabase(data);

  return normalizeLink(updatedLink);
}

async function deleteLinkByIdAndUserId(id, userId) {
  if (!isFileDbEnabled()) {
    return normalizeLink(
      await Link.findOneAndDelete({
        _id: id,
        userId,
      }),
    );
  }

  const data = await readFileDatabase();
  const linkIndex = data.links.findIndex(
    (link) => link.id === id && link.userId === userId,
  );

  if (linkIndex === -1) {
    return null;
  }

  const [deletedLink] = data.links.splice(linkIndex, 1);
  await writeFileDatabase(data);

  return normalizeLink(deletedLink);
}

module.exports = {
  createLink,
  createUser,
  deleteLinkByIdAndUserId,
  ensureFileDatabase,
  existsShortCode,
  findLinkByShortCode,
  findUserByEmail,
  findUserById,
  isFileDbEnabled,
  listLinksByUserId,
  toggleLinkByIdAndUserId,
};
