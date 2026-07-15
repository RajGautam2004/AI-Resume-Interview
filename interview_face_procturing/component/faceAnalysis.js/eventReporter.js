export function reportEvent(event) {
  console.log("Event:", event);

  fetch("http://localhost:5000/api/proctoring-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event,
      timestamp: Date.now(),
    }),
  });
}