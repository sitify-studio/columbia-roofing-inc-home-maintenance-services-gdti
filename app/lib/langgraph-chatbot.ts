import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// Define state for the chatbot
const ChatbotState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  error: Annotation<string>({
    reducer: (x, y) => y || x,
    default: () => "",
  }),
});

interface ChatbotConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class ChatbotError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ChatbotError";
  }
}

export class LangGraphChatbot {
  private graph: any;
  private model: ChatGoogleGenerativeAI;
  private config: ChatbotConfig;

  constructor(config: ChatbotConfig) {
    this.config = {
      model: "gemini-2.5-flash",
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt: "You are a helpful AI assistant for a home maintenance services company. Be friendly, professional, and helpful.",
      ...config,
    };

    if (!this.config.apiKey) {
      throw new ChatbotError("API key is required", "MISSING_API_KEY");
    }

    try {
      this.model = new ChatGoogleGenerativeAI({
        apiKey: this.config.apiKey,
        model: this.config.model!,
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      });
    } catch (error) {
      throw new ChatbotError(
        "Failed to initialize Gemini model",
        "MODEL_INIT_ERROR",
        error
      );
    }

    this.graph = this.buildGraph();
  }

  private buildGraph() {
    // Define the chatbot node
    const chatbotNode = async (state: typeof ChatbotState.State) => {
      try {
        const messages = state.messages;
        
        // Add system prompt if provided
        const messagesWithSystem = this.config.systemPrompt 
          ? [new SystemMessage(this.config.systemPrompt), ...messages]
          : messages;

        const response = await this.model.invoke(messagesWithSystem);
        
        return {
          messages: [response],
          error: "",
        };
      } catch (error) {
        console.error("Chatbot node error:", error);
        const errorMessage = this.handleError(error);
        return {
          error: errorMessage,
        };
      }
    };

    // Define the error handler node
    const errorNode = async (state: typeof ChatbotState.State) => {
      if (state.error) {
        return {
          messages: [
            new AIMessage(
              "I apologize, but I encountered an error. " + state.error
            ),
          ],
        };
      }
      return {};
    };

    // Build the graph
    const workflow = new StateGraph(ChatbotState)
      .addNode("chatbot", chatbotNode)
      .addNode("error_handler", errorNode)
      .addEdge(START, "chatbot")
      .addConditionalEdges(
        "chatbot",
        (state: typeof ChatbotState.State) => {
          return state.error ? "error_handler" : END;
        },
        {
          "error_handler": "error_handler",
          [END]: END,
        }
      )
      .addEdge("error_handler", END);

    return workflow.compile();
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("API key")) {
        return "There's an issue with the API configuration. Please contact support.";
      }
      if (error.message.includes("quota") || error.message.includes("limit")) {
        return "I've reached my usage limit. Please try again later.";
      }
      if (error.message.includes("timeout")) {
        return "The request took too long. Please try again.";
      }
      if (error.message.includes("network")) {
        return "I'm having trouble connecting. Please check your internet and try again.";
      }
      return "An unexpected error occurred. Please try again.";
    }
    return "An unknown error occurred. Please try again.";
  }

  async chat(userMessage: string, conversationHistory: BaseMessage[] = []): Promise<{
    response: string;
    error?: string;
  }> {
    try {
      if (!userMessage || !userMessage.trim()) {
        throw new ChatbotError("Message cannot be empty", "EMPTY_MESSAGE");
      }

      // Validate message length
      if (userMessage.length > 10000) {
        throw new ChatbotError("Message is too long", "MESSAGE_TOO_LONG");
      }

      const messages: BaseMessage[] = [
        ...conversationHistory,
        new HumanMessage(userMessage),
      ];

      const result = await this.graph.invoke({ messages });
      
      const lastMessage = result.messages[result.messages.length - 1];
      const response = lastMessage instanceof AIMessage 
        ? lastMessage.content as string 
        : "I apologize, but I couldn't generate a response.";

      return {
        response,
        error: result.error || undefined,
      };
    } catch (error) {
      console.error("Chat error:", error);
      
      if (error instanceof ChatbotError) {
        return {
          response: "",
          error: error.message,
        };
      }

      return {
        response: "",
        error: "An unexpected error occurred. Please try again.",
      };
    }
  }

  async chatStream(userMessage: string, conversationHistory: BaseMessage[] = []): Promise<AsyncGenerator<string, void, unknown>> {
    try {
      if (!userMessage || !userMessage.trim()) {
        throw new ChatbotError("Message cannot be empty", "EMPTY_MESSAGE");
      }

      const messages: BaseMessage[] = [
        ...conversationHistory,
        new HumanMessage(userMessage),
      ];

      const stream = await this.model.stream(messages);
      
      return (async function* () {
        try {
          for await (const chunk of stream) {
            yield chunk.content as string;
          }
        } catch (error) {
          console.error("Stream error:", error);
          yield "I apologize, but I encountered an error during the response.";
        }
      })();
    } catch (error) {
      console.error("Chat stream error:", error);
      return (async function* () {
        yield "I apologize, but I encountered an error. Please try again.";
      })();
    }
  }
}
