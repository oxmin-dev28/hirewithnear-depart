document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".navbar-hire_component").forEach(initHireComponent);
});

function initHireComponent(container) {
  const depts = container.querySelectorAll(".department-item");
  const rolesList = container.querySelector(".navbar-hire_roles-list-v2, .navbar-hire_roles-list");
  const searchInput = container.querySelector("input#search, input[name='search']");

  if (!rolesList || !depts.length) return;

  const isMobile = () => window.innerWidth <= 991;
  const getRoles = () => Array.from(container.querySelectorAll(".role-item"));
  const getActiveDept = () => container.querySelector(".department-item.is-active:not(.hide)");

  const sortByAlpha = (a, b) => {
    const text = el => el.querySelector(".navbar-hire_roles-link-text")?.textContent.trim().toLowerCase() || "";
    return text(a).localeCompare(text(b));
  };

  let knownRoleCount = 0;

  const reset = () => {
    getRoles().forEach(role => {
      rolesList.appendChild(role);
      Object.assign(role.style, { display: "none", opacity: "0", order: "999" });
    });
    container.querySelectorAll(".roles-inner").forEach(c => c.innerHTML = "");
    container.querySelector(".view-all-mobile")?.remove();
  };

  const selectRoles = (roles) => {
    const sticky = roles.filter(r => r.getAttribute("data-role-sticky")?.toLowerCase() === "true").sort(sortByAlpha);
    const normal = roles.filter(r => r.getAttribute("data-role-sticky")?.toLowerCase() !== "true").sort(sortByAlpha);
    const stickyPick = sticky.slice(0, 16);
    return [...stickyPick, ...normal.slice(0, 16 - stickyPick.length)].sort(sortByAlpha);
  };

  const render = () => {
    const activeDept = getActiveDept();
    if (!activeDept) return;

    const slug = activeDept.getAttribute("data-department")?.toLowerCase().trim();
    if (!slug) return;

    const roles = getRoles();
    if (!roles.length) return;

    const filtered = roles.filter(role =>
      (role.getAttribute("data-role-category") || "").split(/[,;]/).map(s => s.trim().toLowerCase()).includes(slug)
    );

    reset();

    const deptLink = activeDept.querySelector(".navbar-hire_link-v2, .navbar-hire_link");
    const deptNameEl = activeDept.querySelector(".navbar-hire_roles-text, .navbar-hire_link-text");
    const deptName = deptNameEl?.textContent.trim() || "";

    const viewAllBtn = document.createElement("a");
    viewAllBtn.className = "view-all-mobile";
    viewAllBtn.href = deptLink?.href || "#";
    viewAllBtn.style.order = "1000";
    const viewAllInner = document.createElement("div");
    viewAllInner.textContent = `View all ${deptName} roles →`;
    viewAllBtn.appendChild(viewAllInner);

    const parent = isMobile() ? activeDept.querySelector(".roles-inner") : rolesList;
    if (parent) {
      selectRoles(filtered).forEach((role, idx) => {
        parent.appendChild(role);
        Object.assign(role.style, { display: "flex", order: String(idx) });
        setTimeout(() => role.style.opacity = "1", 10);
      });
      parent.appendChild(viewAllBtn);
    }
  };

  depts.forEach(dept => {
    dept.addEventListener("mouseenter", () => {
      if (isMobile() || dept.classList.contains("is-active")) return;
      depts.forEach(d => d.classList.remove("is-active"));
      dept.classList.add("is-active");
      render();
    });

    dept.addEventListener("click", (e) => {
      if (!isMobile()) return;
      if (!dept.querySelector(".roles-inner")) return;
      if (e.target.closest(".navbar-hire_link-v2, .navbar-hire_link")) e.preventDefault();

      const wasActive = dept.classList.contains("is-active");
      reset();
      depts.forEach(d => d.classList.remove("is-active"));

      if (!wasActive) {
        dept.classList.add("is-active");
        render();
      }
    });
  });

  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();

    if (q) {
      reset();
      depts.forEach(d => d.classList.remove("is-active"));
      let count = 0;
      getRoles().sort(sortByAlpha).forEach(role => {
        if (role.textContent.toLowerCase().includes(q) && count < 16) {
          rolesList.appendChild(role);
          Object.assign(role.style, { display: "flex", opacity: "1", order: String(count) });
          count++;
        }
      });
    } else {
      if (!isMobile()) initDesktop();
      render();
    }
  });

  const initDesktop = () => {
    if (isMobile()) return;

    const roles = getRoles();
    if (!roles.length) return;

    if (!getActiveDept()) {
      const firstDept = Array.from(depts).find(d => d.getAttribute("data-department"));
      if (!firstDept) return;
      firstDept.classList.add("is-active");
    }

    render();
  };

  new MutationObserver(() => {
    const currentCount = getRoles().length;
    if (currentCount <= knownRoleCount) return;
    knownRoleCount = currentCount;
    initDesktop();
  }).observe(container, { childList: true, subtree: true });

  const dropdownParent = depts[0]?.closest(".w-dropdown-list") || depts[0]?.parentElement;
  if (dropdownParent) {
    new MutationObserver((mutations) => {
      if (!mutations.some(m => m.type === "attributes")) return;
      if (!isMobile()) initDesktop();
    }).observe(dropdownParent, { attributes: true, attributeFilter: ["class", "style"] });
  }

  initDesktop();
}
