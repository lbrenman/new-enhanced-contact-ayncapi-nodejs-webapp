const contactList = document.getElementById("contacts");

const eventSource = new EventSource("/events");

eventSource.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data && data.contact) {
            const { contact, insights, recommendations } = data;

            const timestamp = new Date().toLocaleString();

            const contactItem = document.createElement("li");
            contactItem.innerHTML = `
                <div class="card">
                    <h2>${contact.name}</h2>
                    <p class="timestamp">Received on: ${timestamp}</p>
                    <p><strong>${contact.title}</strong> at <strong>${contact.company}</strong></p>
                    <p><i>Email:</i> ${contact.email || "N/A"}</p>
                    <p><i>Phone:</i> ${contact.phone || "N/A"}</p>

                    <h3>Insights</h3>
                    <p><strong>Personalized Outreach:</strong> ${insights.personalized_outreach}</p>
                    <p><strong>Industry Summary:</strong> ${insights.industry_summary}</p>
                    <ul>
                        ${insights.talking_points.map(point => `<li>${point}</li>`).join('')}
                    </ul>

                    <h3>Recommendations</h3>
                    <ul>
                        ${recommendations.next_steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            `;

            // Add new contact to the top
            contactList.prepend(contactItem);
        } else {
            console.warn("Invalid event data:", data);
        }
    } catch (error) {
        console.error("Error parsing event data:", error);
    }
};


eventSource.onerror = (error) => {
    console.error("EventSource failed:", error);
};
