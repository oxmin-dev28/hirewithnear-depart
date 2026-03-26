document.addEventListener("DOMContentLoaded", () => {
  const depts = document.querySelectorAll(".department-item");
  const rolesList = document.querySelector(".navbar-hire_roles-list");
  const searchInput = document.getElementById("search");

  const isMobile = () => window.innerWidth <= 991;
  const getRoles = () => Array.from(document.querySelectorAll(".role-item"));
  const sortByAlpha = (a, b) => {
    const text = el => el.querySelector(".navbar-hire_roles-link-text")?.textContent.trim().toLowerCase() || "";
    return text(a).localeCompare(text(b));
  };

  let knownRoleCount = 0;

  const reset = () => {
    console.log("[depart] reset()");
    getRoles().forEach(role => {
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
    const activeDept = document.querySelector(".department-item.is-active");
    if (!activeDept) { console.log("[depart] render() → no active dept"); return; }

    const slug = activeDept.getAttribute("data-department")?.toLowerCase().trim();
    if (!slug) { console.log("[depart] render() → no slug on active dept"); return; }

    const roles = getRoles();
    if (!roles.length) { console.log("[depart] render() → no roles in DOM"); return; }

    console.log(`[depart] render() slug="${slug}" roles=${roles.length}`);
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

    const filtered = roles.filter(role =>
      (role.getAttribute("data-role-category") || "").split(/[,;]/).map(s => s.trim().toLowerCase()).includes(slug)
    );

    const parent = isMobile() ? activeDept.querySelector(".roles-inner") : rolesList;
    console.log(`[depart] render() filtered=${filtered.length} parent=${parent ? (isMobile() ? "roles-inner" : "rolesList") : "null"}`);
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
      if (e.target.closest(".navbar-hire_link")) e.preventDefault();

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
    console.log(`[depart] initDesktop() roles=${roles.length} depts=${depts.length}`);
    if (!roles.length) { console.log("[depart] initDesktop() → waiting for roles"); return; }

    if (!document.querySelector(".department-item.is-active")) {
      const firstDept = Array.from(depts).find(d => d.getAttribute("data-department"));
      console.log(`[depart] initDesktop() firstDept=`, firstDept?.getAttribute("data-department"));
      if (!firstDept) { console.log("[depart] initDesktop() → no dept with data-department yet"); return; }
      firstDept.classList.add("is-active");
    }

    render();
  };

  const observer = new MutationObserver(() => {
    const currentCount = getRoles().length;
    if (currentCount <= knownRoleCount) return;

    console.log(`[depart] observer: roles ${knownRoleCount} → ${currentCount}`);
    knownRoleCount = currentCount;
    initDesktop();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  initDesktop();
});
