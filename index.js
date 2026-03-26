document.addEventListener("DOMContentLoaded", () => {
  const depts = document.querySelectorAll(".department-item");
  const rolesList = document.querySelector(".navbar-hire_roles-list");
  const searchInput = document.getElementById("search");

  console.log(`[depart] DOMContentLoaded — depts=${depts.length} rolesList=${!!rolesList} searchInput=${!!searchInput}`);

  const isMobile = () => window.innerWidth <= 991;
  const getRoles = () => Array.from(document.querySelectorAll(".role-item"));
  const sortByAlpha = (a, b) => {
    const text = el => el.querySelector(".navbar-hire_roles-link-text")?.textContent.trim().toLowerCase() || "";
    return text(a).localeCompare(text(b));
  };

  let knownRoleCount = 0;

  const reset = () => {
    const roles = getRoles();
    console.log(`[depart] reset() — moving ${roles.length} roles back to rolesList`);
    roles.forEach(role => {
      rolesList.appendChild(role);
      Object.assign(role.style, { display: "none", opacity: "0", order: "999" });
    });
    document.querySelectorAll(".roles-inner").forEach(c => c.innerHTML = "");
    document.querySelector(".view-all-mobile")?.remove();
  };

  const selectRoles = (roles) => {
    const sticky = roles.filter(r => r.getAttribute("data-role-sticky")?.toLowerCase() === "true").sort(sortByAlpha);
    const normal = roles.filter(r => r.getAttribute("data-role-sticky")?.toLowerCase() !== "true").sort(sortByAlpha);
    const stickyPick = sticky.slice(0, 16);
    return [...stickyPick, ...normal.slice(0, 16 - stickyPick.length)].sort(sortByAlpha);
  };

  const render = () => {
    const activeDept = document.querySelector(".department-item.is-active:not(.hide)");
    if (!activeDept) { console.warn("[depart] render() → BAIL: no active dept"); return; }

    const slug = activeDept.getAttribute("data-department")?.toLowerCase().trim();
    if (!slug) { console.warn("[depart] render() → BAIL: active dept has no data-department attr", activeDept); return; }

    const roles = getRoles();
    if (!roles.length) { console.warn("[depart] render() → BAIL: no .role-item in DOM"); return; }

    const filtered = roles.filter(role =>
      (role.getAttribute("data-role-category") || "").split(/[,;]/).map(s => s.trim().toLowerCase()).includes(slug)
    );

    console.log(`[depart] render() slug="${slug}" total=${roles.length} filtered=${filtered.length} mobile=${isMobile()}`);

    if (!filtered.length) {
      console.warn(`[depart] render() → 0 roles matched slug "${slug}". Sample data-role-category values:`,
        roles.slice(0, 5).map(r => r.getAttribute("data-role-category"))
      );
    }

    reset();

    const deptLink = activeDept.querySelector(".navbar-hire_link");
    const deptNameEl = activeDept.querySelector(".navbar-hire_roles-text") || activeDept.querySelector(".navbar-hire_link-text");
    const deptName = deptNameEl?.textContent.trim() || "";

    const viewAllBtn = document.createElement("a");
    viewAllBtn.className = "view-all-mobile";
    viewAllBtn.href = deptLink?.href || "#";
    viewAllBtn.style.order = "1000";
    const viewAllInner = document.createElement("div");
    viewAllInner.textContent = `View all ${deptName} roles →`;
    viewAllBtn.appendChild(viewAllInner);

    const parent = isMobile() ? activeDept.querySelector(".roles-inner") : rolesList;
    console.log(`[depart] render() parent=${parent ? (isMobile() ? ".roles-inner" : "rolesList") : "NULL"}`);

    if (parent) {
      const selection = selectRoles(filtered);
      console.log(`[depart] render() appending ${selection.length} roles`);
      selection.forEach((role, idx) => {
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
      console.log(`[depart] mouseenter dept="${dept.getAttribute("data-department")}"`);
      depts.forEach(d => d.classList.remove("is-active"));
      dept.classList.add("is-active");
      render();
    });

    dept.addEventListener("click", (e) => {
      if (!isMobile()) return;
      if (e.target.closest(".navbar-hire_link")) e.preventDefault();

      const wasActive = dept.classList.contains("is-active");
      console.log(`[depart] click dept="${dept.getAttribute("data-department")}" wasActive=${wasActive}`);
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
    console.log(`[depart] search q="${q}"`);

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
      console.log(`[depart] search matched ${count} roles`);
    } else {
      if (!isMobile()) initDesktop();
      render();
    }
  });

  const initDesktop = () => {
    if (isMobile()) return;

    const roles = getRoles();
    const allDepts = Array.from(depts);
    const deptsWithSlug = allDepts.filter(d => d.getAttribute("data-department"));
    const activeDept = document.querySelector(".department-item.is-active:not(.hide)");

    console.log(`[depart] initDesktop() roles=${roles.length} depts=${allDepts.length} deptsWithSlug=${deptsWithSlug.length} active=${activeDept?.getAttribute("data-department") ?? "none"}`);

    if (!roles.length) { console.warn("[depart] initDesktop() → waiting for roles"); return; }

    if (!activeDept) {
      const firstDept = deptsWithSlug[0];
      if (!firstDept) {
        console.warn("[depart] initDesktop() → no dept has data-department yet. All dept attrs:",
          allDepts.map(d => d.getAttribute("data-department"))
        );
        return;
      }
      console.log(`[depart] initDesktop() → setting active: "${firstDept.getAttribute("data-department")}"`);
      firstDept.classList.add("is-active");
    }

    render();
  };

  const rolesObserver = new MutationObserver(() => {
    const currentCount = getRoles().length;
    if (currentCount <= knownRoleCount) return;
    console.log(`[depart] rolesObserver: roles ${knownRoleCount} → ${currentCount}`);
    knownRoleCount = currentCount;
    initDesktop();
  });

  rolesObserver.observe(document.body, { childList: true, subtree: true });

  const dropdownParent = depts[0]?.closest(".w-dropdown-list") || depts[0]?.parentElement;
  console.log("[depart] dropdownParent=", dropdownParent?.className);

  if (dropdownParent) {
    new MutationObserver((mutations) => {
      const changed = mutations.some(m => m.type === "attributes");
      if (!changed) return;
      console.log(`[depart] dropdownObserver: attr change on dropdown parent, class="${dropdownParent.className}" style="${dropdownParent.style.cssText}"`);
      if (!isMobile()) initDesktop();
    }).observe(dropdownParent, { attributes: true, attributeFilter: ["class", "style"] });
  }

  console.log("[depart] observers started, calling initDesktop()");
  initDesktop();
});
