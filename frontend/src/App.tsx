import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    fetch("/api/health")
      .then((d) => d.json())
      .then((d) => console.log(d));
  }, []);

  const [input, setInput] = useState("");
  const conversationId = "8a715726-a484-4af9-ace5-57d0e8eec1b2";
  const [messages, setMessages] = useState<
    { message: string; sender: "user" | "model" }[]
  >([]);
  const [mode, setMode] = useState<"chat" | "upload">("chat");
  const [stream, setStream] = useState("");
  const [loading, setLoading] = useState(false);
  const currentStreamValue = useRef("");

  const handleSubmit = async () => {
    setLoading(true);
    setInput("");
    if (!input.trim()) {
      return;
    }
    setMessages((prev) => [...prev, { message: input, sender: "user" }]);
    const es = new EventSource(
      "/api/chat?query=" + input + "&conversationId=" + conversationId
    );

    es.addEventListener("message", (e) => {
      setLoading(false);
      currentStreamValue.current += (e.data as string).slice(
        1,
        e.data.length - 1
      );
      setStream(currentStreamValue.current);
      console.log(currentStreamValue.current);
    });

    es.addEventListener("end", () => {
      setLoading(false);
      console.log("end", currentStreamValue);
      const n = {
        message: currentStreamValue.current,
        sender: "model" as "user" | "model",
      };

      setMessages((prev) => [...prev, n]);
      currentStreamValue.current = "";
      setStream("");
      es.close();
    });

    es.addEventListener("error", () => {
      setLoading(false);
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          marginTop: "2rem",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button onClick={() => setMode("chat")}>
          {mode == "chat" && "*"}Chat
        </button>
        <button onClick={() => setMode("upload")}>
          {mode == "upload" && "*"}Upload
        </button>
      </div>
      {mode == "chat" && (
        <form
          style={{ overflowY: "scroll" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "0.75rem 1rem",
                  background: m.sender === "model" ? "#363636" : "black",
                  borderRadius: "2rem",
                  width: "fit-content",
                  whiteSpace: "pre-line",
                  maxWidth: "85%",
                  [m.sender === "model" ? "marginRight" : "marginLeft"]: "auto",
                }}
              >
                {m.message}
              </div>
            ))}
            {stream && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "#363636",
                  borderRadius: "2rem",
                  width: "fit-content",
                  whiteSpace: "pre-line",
                  maxWidth: "85%",
                  marginRight: "auto",
                }}
              >
                {stream}
              </div>
            )}
            {loading && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "#363636",
                  borderRadius: "2rem",
                  width: "fit-content",
                  maxWidth: "85%",
                  marginRight: "auto",
                }}
              >
                * * *
              </div>
            )}
          </div>
          <div className="input-container">
            <textarea
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Hello puny human"
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
            />
            <button type="submit">send</button>
          </div>
        </form>
      )}

      {mode == "upload" && (
        <form
          method="POST"
          encType="multipart/form-data"
          action={"http://localhost:8080/api/upload"}
        >
          <input type="file" name="statementDoc" />
          <button type="submit">SUBMIT</button>
        </form>
      )}
    </div>
  );
}

export default App;
