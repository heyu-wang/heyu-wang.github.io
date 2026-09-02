const data = typeof homepageData === "undefined" ? {} : homepageData;
const $ = (selector) => document.querySelector(selector);

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value ?? "";
}

function setOptionalText(selector, value) {
  const element = $(selector);
  if (!element) return;

  const text = typeof value === "string" ? value.trim() : value ?? "";
  element.textContent = text;
  element.hidden = !text;
}

function setHeading(selector, title, icon = "") {
  const element = $(selector);
  if (!element) return;

  element.replaceChildren();
  if (icon) {
    const iconElement = createElement("span", "section-emoji", icon);
    iconElement.setAttribute("aria-hidden", "true");
    element.appendChild(iconElement);
  }
  element.appendChild(document.createTextNode(title));
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function isExternalUrl(url = "") {
  return /^https?:\/\//i.test(url);
}

function linkMark(item) {
  const key = `${item.kind || ""} ${item.label || ""}`.toLowerCase();
  if (key.includes("email")) return "@";
  if (key.includes("github")) return "GH";
  if (key.includes("scholar")) return "GS";
  if (key.includes("linkedin")) return "in";
  if (key.includes("cv") || key.includes("resume")) return "CV";
  return "↗";
}

function makeLink(link, className = "") {
  const anchor = createElement("a", className, link.label || link.url);
  anchor.href = link.url;
  if (isExternalUrl(link.url)) {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
  return anchor;
}

function renderLinks(container, links = []) {
  if (!container) return false;
  container.replaceChildren();

  const validLinks = Array.isArray(links)
    ? links.filter((link) => link && typeof link.url === "string" && link.url.trim())
    : [];

  validLinks.forEach((link) => {
    const anchor = makeLink(link);
    const mark = createElement("span", "link-mark", linkMark(link));
    const label = createElement("span", "link-label", link.label || link.url);
    const arrow = createElement("span", "link-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    anchor.replaceChildren(mark, label, arrow);
    container.appendChild(anchor);
  });

  return validLinks.length > 0;
}

function showPhotoFallback(photo, fallback) {
  if (photo) photo.style.display = "none";
  if (fallback) fallback.style.display = "grid";
}

function renderProfile() {
  const profile = data.profile || {};
  const name = profile.name || "Heyu Wang";
  const photo = $("#profile-photo");
  const fallback = $("#portrait-fallback");

  document.title = `${name} | Academic Homepage`;
  setText("#profile-name", name);
  setOptionalText("#profile-role", profile.role);
  setOptionalText("#profile-location", profile.location);
  setOptionalText("#profile-affiliation", profile.affiliation);
  setOptionalText("#profile-intro", profile.shortIntro);
  setText("#current-text", profile.current);
  setText("#portrait-fallback", profile.initials || name.slice(0, 2).toUpperCase());
  setText("#footer-name", name);

  if (photo) {
    photo.removeAttribute("src");
    photo.alt = `${name} profile photo`;
    photo.onload = () => {
      photo.style.display = "block";
      if (fallback) fallback.style.display = "none";
    };
    photo.onerror = () => showPhotoFallback(photo, fallback);

    if (typeof profile.photo === "string" && profile.photo.trim()) {
      photo.src = profile.photo;
    } else {
      showPhotoFallback(photo, fallback);
    }
  }

  const hasLinks = renderLinks($("#sidebar-links"), profile.links);
  const contactBox = $("#contact-box");
  if (contactBox) contactBox.hidden = !hasLinks;

  const currentBox = $("#current-box");
  if (currentBox) currentBox.hidden = !profile.current;
}

function renderAbout() {
  const section = $("#about");
  const about = data.about || {};
  const paragraphs = Array.isArray(about.paragraphs) ? about.paragraphs.filter(Boolean) : [];
  const container = $("#about-text");

  setHeading("#about-title", about.title || "About me", about.icon || "");
  container.replaceChildren();
  paragraphs.forEach((paragraph) => {
    const element = createElement("p");

    if (typeof paragraph === "string") {
      element.textContent = paragraph;
    } else if (Array.isArray(paragraph?.parts)) {
      paragraph.parts.forEach((part) => {
        const text = typeof part === "string" ? part : part?.text;
        if (!text) return;

        if (typeof part === "object" && part.url) {
          element.appendChild(makeLink({ label: text, url: part.url }));
        } else {
          element.appendChild(document.createTextNode(text));
        }
      });
    }

    if (element.textContent.trim()) container.appendChild(element);
  });
  section.hidden = paragraphs.length === 0;
}

function renderInterests() {
  const section = $("#interests");
  const container = $("#interest-list");
  const interests = Array.isArray(data.interests) ? data.interests : [];

  container.replaceChildren();
  interests.forEach((item) => {
    const article = createElement("article", "interest-item");
    article.appendChild(createElement("h3", "", item.title || ""));
    if (item.description) article.appendChild(createElement("p", "", item.description));
    container.appendChild(article);
  });
  section.hidden = interests.length === 0;
}

function renderTimelineSection(sectionSelector, containerSelector, entries = []) {
  const section = $(sectionSelector);
  const container = $(containerSelector);
  const timelineEntries = Array.isArray(entries) ? entries : [];

  if (!section || !container) return;

  container.replaceChildren();
  timelineEntries.forEach((item) => {
    const article = createElement("article", "timeline-item");
    const details = createElement("div");
    const time = createElement("div", "timeline-time", item.time || "");

    if (item.type) details.appendChild(createElement("span", "timeline-type", item.type));
    details.appendChild(createElement("h3", "timeline-role", item.role || ""));
    if (item.place) details.appendChild(createElement("p", "timeline-place", item.place));
    if (item.description) details.appendChild(createElement("p", "timeline-desc", item.description));

    article.append(time, details);
    container.appendChild(article);
  });
  section.hidden = timelineEntries.length === 0;
}

function renderHobbies() {
  const section = $("#hobbies");
  const container = $("#hobby-list");
  const hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];

  if (!section || !container) return;

  container.replaceChildren();
  hobbies.forEach((item) => {
    const article = createElement("p", "hobby-copy", item.description || item.title || "");
    container.appendChild(article);
  });
  section.hidden = hobbies.length === 0;
}

function renderHonors() {
  const section = $("#honors");
  const container = $("#honor-list");
  const honors = Array.isArray(data.honors) ? data.honors : [];

  const organization = data.honorsOrganization ? ` · ${data.honorsOrganization}` : "";
  setOptionalText("#honors-organization", organization);
  container.replaceChildren();
  honors.forEach((item) => {
    const article = createElement("article", "honor-item");
    const details = createElement("div");

    details.appendChild(createElement("h3", "honor-title", item.title || ""));
    if (item.organization) details.appendChild(createElement("p", "honor-org", item.organization));
    article.append(createElement("div", "honor-year", item.year || ""), details);
    container.appendChild(article);
  });
  section.hidden = honors.length === 0;
}

function renderSimpleSection(sectionId, containerId, items, isPublication = false) {
  const section = $(sectionId);
  const container = $(containerId);
  const entries = Array.isArray(items) ? items : [];

  container.replaceChildren();
  entries.forEach((item) => {
    const article = createElement("article", "simple-item");
    const details = createElement("div");
    const meta = isPublication ? [item.authors, item.venue].filter(Boolean).join(" · ") : "";

    details.appendChild(createElement("h3", "simple-title", item.title || ""));
    if (meta) details.appendChild(createElement("p", "simple-meta", meta));
    if (item.description) details.appendChild(createElement("p", "simple-desc", item.description));

    const links = Array.isArray(item.links)
      ? item.links.filter((link) => link && typeof link.url === "string" && link.url.trim())
      : [];
    if (links.length) {
      const linkList = createElement("div", "simple-links");
      links.forEach((link) => linkList.appendChild(makeLink(link)));
      details.appendChild(linkList);
    }

    article.append(createElement("div", "simple-year", item.year || ""), details);
    container.appendChild(article);
  });

  section.hidden = entries.length === 0;
}

function init() {
  renderProfile();
  renderAbout();
  renderInterests();
  renderTimelineSection("#education", "#education-list", data.education);
  renderTimelineSection("#experience", "#experience-list", data.experience);
  renderHonors();
  renderSimpleSection("#publications", "#publication-list", data.publications, true);
  renderSimpleSection("#projects", "#project-list", data.projects);
  renderHobbies();
  setText("#footer-year", `© ${new Date().getFullYear()}`);
}

document.addEventListener("DOMContentLoaded", init);
