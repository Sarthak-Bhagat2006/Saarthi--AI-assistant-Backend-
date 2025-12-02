import "dotenv/config";

const getAPIResponce = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:8080",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "google/gemma-3n-e4b-it:free",
            messages: [
                { role: "user", content: message }
            ]
        })
    };

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", options);
        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            console.log("Unexpected API response:", data);
            return "Error calling AI";
        }
        const raw = data.choices[0].message.content;

        // If model returns {reply: "..."}
        if (typeof raw === "object" && raw.reply) {
            return raw.reply;
        }

        // Else normal string
        return raw;

    } catch (error) {
        console.log("Fetch error:", error);
        return "Error calling AI";
    }
};

export default getAPIResponce;