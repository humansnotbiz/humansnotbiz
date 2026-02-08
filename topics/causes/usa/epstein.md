---
title: Epstein Documents
permalink: "/topics/causes/usa/epstein/index.html"
layout: layouts/resource.njk
lastReviewed: 2026-01-30
---

<section class="tool-card" style="padding:16px; border:1px solid var(--border); border-radius:16px;">
  <h3 style="margin-top:0;">Release status</h3>

  <p style="margin:0 0 10px 0;">
    <strong>Legal deadline:</strong> December 19, 2025<br>
    <strong>Status:</strong> Deadline missed<br>
    <strong>Time overdue:</strong>
    <span id="epsteinElapsed">calculating…</span><br>
    <strong>Next public release:</strong> No date announced
  </p>

  <p style="margin:0; color: var(--muted);">
    This counter shows time elapsed since the statutory DOJ deadline.
  </p>
</section>

<script>
(function () {
  const el = document.getElementById("epsteinElapsed");
  if (!el) return;

  // Dec 19, 2025 at 12:00 UTC to avoid timezone edge cases
  const deadline = new Date(Date.UTC(2025, 11, 19, 12, 0, 0));

  function update() {
    const now = new Date();
    let diff = Math.max(0, now - deadline);

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const h = hours % 24;
    const m = minutes % 60;
    const s = seconds % 60;

    el.textContent =
      days + " days " +
      h + " hours " +
      m + " minutes " +
      s + " seconds";
  }

  update();
  setInterval(update, 1000);
})();
</script>


Below are some of the more incriminating content and source court anchored documents. 

 ---

 #### Peg <Peg>
> I really prefer Europe...but I am having a tough time putting it together.=> Aspen is easy and Susan Hess wants me to come to Malibu...

> Will call later...just getting up.

> So glad you came last night.

> The girl was too young. You walked into a room of journalist...including T=na Brown's husband....even though she was adorable and sweet. I wanted to k=lI you. She gave me her first name and I screamed at her to always say her f=II name....I don't care if it's made up. It is s0000 moronic just to say f=rst name...PLEASE get over that.

> Also, I got very nervous that you are back to old tricks. Your next "prob=em" with authorities will be your last.

> I need your friendship too much to lose you...

#### Jeffrey <jeevacation@gmail.com>
> She s 25 if you prefer I'll stick to 30 and above.

> Sorry for all the typos. Sent from my iPhone

**U.S. Department of Justice, Epstein case materials:**  [EFTA02362640.pdf](https://www.justice.gov/epstein/files/DataSet%2011/EFTA02362640.pdf)
 
 ---