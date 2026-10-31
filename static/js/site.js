(function () {
  const modal = document.getElementById("lead-modal");
  const open = (source) => {
    const field = modal?.querySelector('[name="source"]');
    if (field && source) field.value = source;
    modal?.showModal();
  };
  document.querySelectorAll("[data-open-lead]").forEach((el) => {
    el.addEventListener("click", () => open(el.getAttribute("data-open-lead")));
  });
  document.querySelectorAll("[data-close-lead]").forEach((el) => {
    el.addEventListener("click", () => modal?.close());
  });

  const show = document.querySelector("[data-slideshow]");
  if (show) {
    const frames = [...show.querySelectorAll("img")];
    const dotsBox = show.querySelector("[data-slide-dots]");
    let index = 0;
    let timer;
    const paint = (next) => {
      index = (next + frames.length) % frames.length;
      frames.forEach((img, i) => img.classList.toggle("is-on", i === index));
      dotsBox.querySelectorAll("button").forEach((dot, i) => dot.classList.toggle("is-on", i === index));
    };
    frames.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Кадр " + (i + 1));
      if (i === 0) dot.classList.add("is-on");
      dot.addEventListener("click", () => { paint(i); arm(); });
      dotsBox.appendChild(dot);
    });
    const arm = () => {
      clearInterval(timer);
      timer = setInterval(() => paint(index + 1), 5000);
    };
    show.querySelectorAll("[data-slide]").forEach((btn) => {
      btn.addEventListener("click", () => {
        paint(index + Number(btn.getAttribute("data-slide")));
        arm();
      });
    });
    let touchX = 0;
    show.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    show.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) < 40) return;
      paint(index + (dx < 0 ? 1 : -1));
      arm();
    });
    arm();
  }

  const drawer = document.querySelector("[data-nav-mobile]");
  document.querySelector("[data-nav-toggle]")?.addEventListener("click", () => {
    drawer.hidden = !drawer.hidden;
  });

  async function send(form) {
    const status = form.querySelector(".status");
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.page_url = location.href;
    if (status) { status.hidden = false; status.className = "status"; status.textContent = "Отправка…"; }
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "");
      if (status) { status.textContent = data.message; status.classList.add("ok"); }
      form.reset();
      if (form.id === "lead-form") setTimeout(() => modal?.close(), 1600);
    } catch (err) {
      if (status) {
        status.textContent = "Не удалось отправить. Позвоните +7 906 775 33 33";
        status.classList.add("err");
      }
    }
  }

  window.preobrazhenieSubmitLead = (ev) => { ev.preventDefault(); send(ev.target); };
  document.getElementById("lead-form")?.addEventListener("submit", window.preobrazhenieSubmitLead);
  document.querySelectorAll("[data-inline-lead]").forEach((form) => {
    form.addEventListener("submit", window.preobrazhenieSubmitLead);
  });

  let armed = false;
  setTimeout(() => { armed = true; }, 8000);
  document.addEventListener("mouseout", (e) => {
    if (!armed || e.clientY > 8 || modal?.open) return;
    if (sessionStorage.getItem("lead-exit")) return;
    sessionStorage.setItem("lead-exit", "1");
    open("exit");
  });
})();
