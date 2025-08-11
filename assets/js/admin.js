// Admin dashboard logic for Prestige Hair (localStorage powered)
(function () {
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) =>
    Array.from(parent.querySelectorAll(sel));
  const read = (k, fallback = null) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // Preview helpers and simple lock using localStorage access code
  let previewTimer;
  function refreshPreview() {
    const frame = document.getElementById("previewFrame");
    const select = document.getElementById("previewSelect");
    if (!frame || !select) return;
    const page = select.value || "../../public/index.html";
    frame.src = page + (page.includes("?") ? "&" : "?") + "r=" + Date.now();
  }
  function schedulePreviewRefresh() {
    const auto = document.getElementById("autoRefresh");
    if (!auto || !auto.checked) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(refreshPreview, 700);
  }
  function initPreview() {
    const select = document.getElementById("previewSelect");
    const btn = document.getElementById("refreshPreview");
    select?.addEventListener("change", refreshPreview);
    btn?.addEventListener("click", refreshPreview);
    refreshPreview();
  }

  const LOCK_KEY = "admin_passcode";
  const getPass = () => localStorage.getItem(LOCK_KEY) || "mycode";

  function showLock() {
    $("#lockScreen")?.classList.add("active");
  }
  function hideLock() {
    $("#lockScreen")?.classList.remove("active");
  }

  function initLock() {
    const unlockBtn = $("#unlockBtn");
    const passInput = $("#passInput");
    const logoutBtn = $("#logoutBtn");

    // If not unlocked yet, show lock
    showLock();

    unlockBtn?.addEventListener("click", () => {
      if ((passInput?.value || "").trim() === getPass()) hideLock();
      else alert("Incorrect access code");
    });
    logoutBtn?.addEventListener("click", showLock);

    // Enter to submit
    passInput?.addEventListener("keyup", (e) => {
      if (e.key === "Enter") unlockBtn?.click();
    });
  }

  // Tabs
  function initTabs() {
    const tabs = $$(".admin-tab");
    tabs.forEach((btn) =>
      btn.addEventListener("click", () => {
        tabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const id = btn.getAttribute("data-tab");
        $$(".admin-panel").forEach((p) => p.classList.remove("active"));
        $(`#tab-${id}`)?.classList.add("active");
      })
    );
  }

  // Image helpers
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  function bindDropArea(areaEl, inputEl, onFiles) {
    [areaEl, inputEl].forEach((el) => {
      if (!el) return;
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        areaEl.classList.add("drag");
      });
      el.addEventListener("dragleave", () => areaEl.classList.remove("drag"));
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        areaEl.classList.remove("drag");
        onFiles(e.dataTransfer?.files);
      });
    });
    inputEl?.addEventListener("change", (e) => onFiles(e.target.files));
  }

  // Drag & sort helper
  function enableDragSort(container, itemSelector, onUpdate) {
    const el = typeof container === "string" ? $(container) : container;
    if (!el) return;
    const setDraggable = () => {
      $$(itemSelector, el).forEach((item) =>
        item.setAttribute("draggable", "true")
      );
    };
    setDraggable();
    const observer = new MutationObserver(setDraggable);
    observer.observe(el, { childList: true });

    let dragEl = null;
    el.addEventListener("dragstart", (e) => {
      const target = e.target.closest(itemSelector);
      if (!target) return;
      dragEl = target;
      target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "drag");
    });
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      const over = e.target.closest(itemSelector);
      if (!over || over === dragEl) return;
      over.classList.add("drag-over");
    });
    el.addEventListener("dragleave", (e) => {
      const over = e.target.closest(itemSelector);
      if (over) over.classList.remove("drag-over");
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const over = e.target.closest(itemSelector);
      $$(itemSelector, el).forEach((i) => i.classList.remove("drag-over"));
      if (dragEl && over && dragEl !== over) {
        const items = $$(itemSelector, el);
        const dragIndex = items.indexOf(dragEl);
        const overIndex = items.indexOf(over);
        if (dragIndex < overIndex) over.after(dragEl);
        else over.before(dragEl);
        onUpdate && onUpdate();
      }
    });
    el.addEventListener("dragend", () => {
      if (dragEl) dragEl.classList.remove("dragging");
      dragEl = null;
    });
  }

  // HERO
  function initHero() {
    const data = read("content_hero", {});
    $("#heroTitle").value = data.title || "";
    $("#heroDescription").value = data.description || "";
    if (data.image) $("#heroImagePreview").src = data.image;

    bindDropArea($("#heroImageDrop"), $("#heroImageInput"), async (files) => {
      const f = files && files[0];
      if (!f) return;
      const url = await fileToDataUrl(f);
      $("#heroImagePreview").src = url;
      // auto-save & preview
      write("content_hero", {
        title: $("#heroTitle").value,
        description: $("#heroDescription").value,
        image: url,
      });
      schedulePreviewRefresh();
    });

    const saveHeroDraft = () => {
      write("content_hero", {
        title: $("#heroTitle").value,
        description: $("#heroDescription").value,
        image: $("#heroImagePreview").getAttribute("src") || null,
      });
      schedulePreviewRefresh();
    };
    $("#heroTitle")?.addEventListener("input", saveHeroDraft);
    $("#heroDescription")?.addEventListener("input", saveHeroDraft);

    $("#saveHero")?.addEventListener("click", () => {
      const save = {
        title: $("#heroTitle").value,
        description: $("#heroDescription").value,
        image: $("#heroImagePreview").getAttribute("src") || null,
      };
      write("content_hero", save);
      alert("Hero saved. Visit your site to see the changes!");
      schedulePreviewRefresh();
    });
  }

  // SERVICES
  function initServices() {
    const defaults = [
      {
        title: "Premium Wigs",
        description: "Luxury human hair wigs crafted to perfection.",
      },
      {
        title: "Hair Bundles",
        description: "High-quality virgin hair bundles.",
      },
      {
        title: "Frontals",
        description: "Seamless HD lace frontals for natural hairline.",
      },
      {
        title: "Hair Care",
        description: "Professional styling & premium care products.",
      },
    ];
    const data = read("content_services", defaults);
    const list = $("#servicesList");
    list.innerHTML = "";
    data.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "service-row";
      row.innerHTML = `
        <div class="row-left">
          <span class="index">#${i + 1}</span>
          <input class="srv-title" placeholder="Title" value="${
            item.title || ""
          }">
          <input class="srv-desc" placeholder="Description" value="${
            item.description || ""
          }">
        </div>
      `;
      list.appendChild(row);
    });

    const saveServicesNow = () => {
      const items = $$(".service-row").map((r) => ({
        title: $(".srv-title", r).value,
        description: $(".srv-desc", r).value,
      }));
      write("content_services", items);
      schedulePreviewRefresh();
    };

    list.addEventListener("input", saveServicesNow);
    enableDragSort("#servicesList", ".service-row", saveServicesNow);

    $("#saveServices")?.addEventListener("click", () => {
      saveServicesNow();
      alert("Services saved!");
    });
  }

  // GALLERY
  function renderGalleryAdmin(items) {
    const wrap = $("#galleryItems");
    wrap.innerHTML = "";
    items.forEach((g, idx) => {
      const card = document.createElement("div");
      card.className = "gallery-admin-item";
      card.innerHTML = `
        <img src="${g.src}" alt="${g.alt || "Gallery"}" />
        <div class="meta">
          <select class="g-cat">
            <option value="wigs" ${
              g.category === "wigs" ? "selected" : ""
            }>Wigs</option>
            <option value="bundles" ${
              g.category === "bundles" ? "selected" : ""
            }>Bundles</option>
            <option value="frontals" ${
              g.category === "frontals" ? "selected" : ""
            }>Frontals</option>
            <option value="styled" ${
              g.category === "styled" ? "selected" : ""
            }>Styled</option>
          </select>
          <input class="g-title" placeholder="Title" value="${g.title || ""}" />
          <input class="g-sub" placeholder="Subtitle" value="${
            g.subtitle || ""
          }" />
          <button class="btn btn-outline g-del"><i class="fas fa-trash"></i></button>
        </div>
      `;
      $(".g-del", card).addEventListener("click", () => {
        items.splice(idx, 1);
        write("content_gallery", items);
        renderGalleryAdmin(items);
      });
      wrap.appendChild(card);
    });
  }

  function initGallery() {
    const items = read("content_gallery", []);
    renderGalleryAdmin(items);

    // Drag sort & meta change autosave
    const saveGalleryNow = () => {
      const newItems = $$("#galleryItems .gallery-admin-item").map((card) => ({
        src: $("img", card).src,
        category: $(".g-cat", card).value,
        title: $(".g-title", card).value,
        subtitle: $(".g-sub", card).value,
        alt: $("img", card).alt || "Gallery item",
      }));
      write("content_gallery", newItems);
      schedulePreviewRefresh();
    };

    enableDragSort("#galleryItems", ".gallery-admin-item", saveGalleryNow);
    $("#galleryItems").addEventListener("input", (e) => {
      if (e.target.matches(".g-cat, .g-title, .g-sub")) saveGalleryNow();
    });

    bindDropArea($("#galleryDrop"), $("#galleryInput"), async (files) => {
      const cat = $("#galleryCategory").value;
      const filesArr = Array.from(files || []);
      for (const f of filesArr) {
        const src = await fileToDataUrl(f);
        items.push({
          src,
          category: cat,
          title: "",
          subtitle: "",
          alt: "Gallery item",
        });
      }
      renderGalleryAdmin(items);
      write("content_gallery", items);
      schedulePreviewRefresh();
    });

    $("#saveGallery")?.addEventListener("click", () => {
      saveGalleryNow();
      alert("Gallery saved!");
    });
  }

  // TESTIMONIALS
  function renderTestimonialsAdmin(list) {
    const wrap = $("#testimonialsList");
    wrap.innerHTML = "";
    list.forEach((t, idx) => {
      const row = document.createElement("div");
      row.className = "list-row";
      row.innerHTML = `
        <div class="avatar"><img src="${
          t.avatar || "https://placehold.co/64x64"
        }" alt="${t.name || "Client"}"></div>
        <div class="info">
          <strong>${t.name || "Anonymous"}</strong>
          <small>${t.location || ""}</small>
          <p>${t.text || ""}</p>
          <div class="stars">${"★".repeat(t.stars || 5)}</div>
        </div>
        <button class="btn btn-outline del"><i class="fas fa-trash"></i></button>
      `;
      $(".del", row).addEventListener("click", () => {
        list.splice(idx, 1);
        write("content_testimonials", list);
        renderTestimonialsAdmin(list);
      });
      wrap.appendChild(row);
    });
  }

  function initTestimonials() {
    const list = read("content_testimonials", []);
    renderTestimonialsAdmin(list);

    const saveTestimonialsNow = () => {
      const newList = $$("#testimonialsList .list-row").map((row) => ({
        avatar: $(".avatar img", row)?.src || null,
        name: $(".info strong", row)?.textContent || "",
        location: $(".info small", row)?.textContent || "",
        text: $(".info p", row)?.textContent || "",
        stars: ($(".stars", row)?.textContent || "★★★★★").length,
      }));
      write("content_testimonials", newList);
      schedulePreviewRefresh();
    };

    enableDragSort("#testimonialsList", ".list-row", saveTestimonialsNow);

    let avatarData = null;
    bindDropArea($("#tAvatarDrop"), $("#tAvatarInput"), async (files) => {
      const f = files && files[0];
      if (!f) return;
      avatarData = await fileToDataUrl(f);
    });

    $("#addTestimonial")?.addEventListener("click", () => {
      const t = {
        name: $("#tName").value,
        location: $("#tLocation").value,
        stars: parseInt($("#tStars").value || "5", 10),
        text: $("#tText").value,
        avatar: avatarData,
      };
      if (!t.text) return alert("Please enter feedback text");
      list.push(t);
      renderTestimonialsAdmin(list);
      write("content_testimonials", list);
      schedulePreviewRefresh();
      $("#tName").value = "";
      $("#tLocation").value = "";
      $("#tText").value = "";
      avatarData = null;
    });

    $("#saveTestimonials")?.addEventListener("click", () => {
      write("content_testimonials", list);
      alert("Testimonials saved!");
      schedulePreviewRefresh();
    });
  }

  // CONTACT
  function initContact() {
    const c = read("content_contact", {
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
    });
    $("#cPhone").value = c.phone || "";
    $("#cWhats").value = c.whatsapp || "";
    $("#cEmail").value = c.email || "";
    $("#cAddress").value = c.address || "";

    function syncPrev() {
      $("#prevPhone").textContent = $("#cPhone").value;
      $("#prevWhats").textContent = $("#cWhats").value;
      $("#prevEmail").textContent = $("#cEmail").value;
      $("#prevAddress").textContent = $("#cAddress").value;
    }
    ["cPhone", "cWhats", "cEmail", "cAddress"].forEach((id) =>
      $("#" + id).addEventListener("input", () => {
        syncPrev();
        write("content_contact", {
          phone: $("#cPhone").value,
          whatsapp: $("#cWhats").value,
          email: $("#cEmail").value,
          address: $("#cAddress").value,
        });
        schedulePreviewRefresh();
      })
    );
    syncPrev();

    $("#saveContact")?.addEventListener("click", () => {
      write("content_contact", {
        phone: $("#cPhone").value,
        whatsapp: $("#cWhats").value,
        email: $("#cEmail").value,
        address: $("#cAddress").value,
      });
      alert("Contact info saved!");
    });
  }

  // SETTINGS
  function initSettings() {
    $("#savePass")?.addEventListener("click", () => {
      const val = ($("#newPass")?.value || "").trim();
      if (!val) return alert("Enter a new access code");
      localStorage.setItem(LOCK_KEY, val);
      alert("Access code updated. Please remember it!");
    });

    $("#clearAllBtn")?.addEventListener("click", () => {
      if (
        confirm(
          "This will remove all saved content from this browser. Continue?"
        )
      ) {
        [
          "content_hero",
          "content_services",
          "content_gallery",
          "content_testimonials",
          "content_contact",
        ].forEach((k) => localStorage.removeItem(k));
        alert("All saved content cleared!");
      }
    });
  }

  // INIT
  document.addEventListener("DOMContentLoaded", () => {
    initLock();
    initTabs();
    initHero();
    initServices();
    initGallery();
    initTestimonials();
    initContact();
    initSettings();
    initPreview();
  });
})();
