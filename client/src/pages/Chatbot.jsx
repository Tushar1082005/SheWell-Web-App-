import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, LanguagesIcon, MessageCircle, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import axios from "axios";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

// Register the TextPlugin with GSAP
gsap.registerPlugin(TextPlugin);

export default function Chatbot() {
  const [language, setLanguage] = useState("english");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI women's health assistant. How can I help you today?",
      id: "initial-message"
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentlyTyping, setCurrentlyTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Generate unique IDs for messages
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add this effect
useEffect(() => {
  document.body.setAttribute('data-currently-typing', currentlyTyping);
}, [currentlyTyping]);

  useEffect(() => {
    console.log("Current language:", language);
  }, [language]);

  // GSAP typing animation function
  // GSAP typing animation function (alternative approach)
const animateTyping = (messageId, content) => {
  setCurrentlyTyping(true);
  const messageElement = document.getElementById(messageId);
  
  if (!messageElement) {
    console.error("Message element not found:", messageId);
    setCurrentlyTyping(false);
    return;
  }

  // Format the entire content, replacing newlines with <br> tags
  const formattedContent = formatTextForHTML(content).replace(/\n/g, '<br/>');
  
  // Start with empty content
  messageElement.innerHTML = '';
  
  // Create a single animation for the entire content
  gsap.to(messageElement, {
    duration: Math.min(2, content.length * 0.01), // Cap duration at 2 seconds
    text: {
      value: formattedContent,
      preserveSpaces: true,
      newClass: "typing-text"
    },
    ease: "none",
    onComplete: () => {
      // Remove the typing-text class when complete
      messageElement.classList.remove('typing-text');
      setCurrentlyTyping(false);
    }
  });
};
  
  // Format text for HTML display
  const formatTextForHTML = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\* (.*?)(?=\n|$)/g, "• $1");
  };

  // Update greeting message when language changes
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    console.log(`Language changed to: ${newLanguage}`);

    const greetings = {
      english: "Hello! I'm your AI women's health assistant. How can I help you today?",
      spanish: "¡Hola! Soy tu asistente de IA para la salud de la mujer. ¿Cómo puedo ayudarte hoy?",
      french: "Bonjour! Je suis votre assistante IA pour la santé des femmes. Comment puis-je vous aider aujourd'hui?",
      hindi: "नमस्ते! मैं आपकी AI महिला स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकती हूं?",
    };

    const newMessageId = generateMessageId();
    
    setMessages([
      {
        role: "assistant",
        content: greetings[newLanguage] || greetings.english,
        id: newMessageId
      },
    ]);
    
    // Add a small delay to ensure the component has rendered
    setTimeout(() => {
      animateTyping(newMessageId, greetings[newLanguage] || greetings.english);
    }, 100);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || currentlyTyping) return;

    const userMessage = { 
      role: "user", 
      content: input,
      id: generateMessageId()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log(`Sending request with language: ${language}`);
      const response = await axios.post("http://localhost:3001/api/chat", {
        message: input,
        language,
        previousMessages: messages.filter(
          (msg) => messages.length - messages.indexOf(msg) <= 6
        ),
      });

      const newMessageId = generateMessageId();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.response,
          id: newMessageId
        },
      ]);
      
      setLoading(false);
      
      // Start typing animation after a brief delay
      setTimeout(() => {
        animateTyping(newMessageId, response.data.response);
      }, 100);
      
    } catch (error) {
      console.error("Error:", error);

      let errorMessage = "Sorry, something went wrong. Please try again.";
      if (error.response?.data?.details) {
        errorMessage = `Error: ${error.response.data.details}`;
      }

      const newMessageId = generateMessageId();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          id: newMessageId
        },
      ]);
      
      setLoading(false);
      
      // Animate error message as well
      setTimeout(() => {
        animateTyping(newMessageId, errorMessage);
      }, 100);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-8">
        <div className="container max-w-[80%] mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/">
              <Button variant="outline" size="icon" asChild>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-primary">
              Women's Health Assistant
            </h1>
          </div>

          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <MessageCircle className="h-5 w-5" />
                    Health Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask questions about women's health
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={language}
                    onValueChange={(newValue) => {
                      console.log("SELECT VALUE CHANGED TO:", newValue);
                      handleLanguageChange(newValue);
                    }}
                  >
                    {/* Your Select component */}
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-[400px] overflow-y-auto p-4 rounded-md border">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "assistant"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "assistant"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      } prose prose-sm`}
                    >
                      <div 
                        id={message.id}
                        className={message.role === "assistant" ? "assistant-message" : ""}
                      >
                        {message.role === "user" ? 
                          formatTextForHTML(message.content) : 
                          // Assistant messages start empty and get filled by animation
                          ""
                        }
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter>
              <form
                onSubmit={handleSubmit}
                className="flex w-full items-center space-x-2"
              >
                <Input
                  placeholder="Type your health question..."
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1"
                  disabled={loading || currentlyTyping}
                />
                <Button type="submit" size="icon" disabled={loading || currentlyTyping}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Suggested Topics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Menstrual Health",
                "Reproductive Health",
                "Pregnancy",
                "Menopause",
                "Sexual Health",
                "Breast Health",
              ].map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  className="justify-start hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    setInput(`Tell me about ${topic.toLowerCase()}`)
                  }
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
  .typing-dots {
    display: flex;
    padding: 6px;
  }
  .typing-dots span {
    height: 8px;
    width: 8px;
    margin: 0 4px;
    background-color: #e84393;
    border-radius: 50%;
    opacity: 0.7;
    display: inline-block;
    animation: pulse 1.5s infinite ease-in-out;
  }
  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  .typing-text::after {
    content: '|';
    display: none; /* Hide by default */
    animation: blink 0.7s infinite;
  }
  body:has([data-currently-typing="true"]) .typing-text::after {
    display: inline-block; /* Only show when typing */
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`}</style>
    </div>
  );
}