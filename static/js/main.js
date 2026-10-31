(function () {
  const modal = document.getElementById("lead-modal");

  function openLead(source) {
    if (!modal) return;
    const src = modal.querySelector('input[name="source"]');
    if (src && source) src.value = source;
    modal.showModal();
  }

  document.querySelectorAll("[data-open-lead]").forEach((el) => {
    el.addEventListener("click", () => openLead(el.getAttribute("data-open-lead")));
  });
  document.querySelectorAll("[data-close-lead]").forEach((el) => {
    el.addEventListener("click", () => modal?.close());
  });

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMobile = document.querySelector("[data-nav-mobile]");
  navToggle?.addEventListener("click", () => {
    const open = navMobile.hidden;
    navMobile.hidden = !open;
  });

  async function submitLead(form, statusEl) {
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.page_url = window.location.href;
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = "Отправка…";
      statusEl.className = "form-status";
    }
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      if (statusEl) {
        statusEl.textContent = data.message || "Спасибо, перезвоним.";
        statusEl.classList.add("ok");
      }
      form.reset();
      if (form.id === "lead-form") setTimeout(() => modal?.close(), 1800);
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = e.message || "Не удалось отправить";
        statusEl.classList.add("err");
      }
    }
  }

  window.preobrazhenieSubmitLead = function (ev) {
    ev.preventDefault();
    submitLead(ev.target, ev.target.querySelector(".form-status"));
  };

  document.getElementById("lead-form")?.addEventListener("submit", window.preobrazhenieSubmitLead);
  document.querySelectorAll("[data-inline-lead]").forEach((form) => {
    form.addEventListener("submit", window.preobrazhenieSubmitLead);
  });
})();
