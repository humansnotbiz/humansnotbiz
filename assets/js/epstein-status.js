// Epstein release status counter
// Looks for: .js-epstein-status containers
// Uses: data-deadline-utc="2025-12-19T12:00:00Z"
// Writes into: .js-epstein-elapsed

(function () {
    function formatElapsed(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.floor(totalHours / 24);

        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;

        return (
            days + " days " +
            hours + " hours " +
            minutes + " minutes " +
            seconds + " seconds"
        );
    }

    function init(container) {
        const output = container.querySelector(".js-epstein-elapsed");
        if (!output) return;

        const deadlineStr = container.getAttribute("data-deadline-utc");
        if (!deadlineStr) return;

        const deadline = new Date(deadlineStr);
        if (Number.isNaN(deadline.getTime())) return;

        function update() {
            const now = new Date();
            const diff = Math.max(0, now.getTime() - deadline.getTime());
            output.textContent = formatElapsed(diff);
        }

        update();
        window.setInterval(update, 1000);
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".js-epstein-status").forEach(init);
    });
})();
