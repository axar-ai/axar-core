import { model, systemPrompt, Agent } from "@axarai/axar";

// Specify the AI model used by the agent
@model('openai:gpt-4o-mini')
// Provide a system-level prompt to guide the agent's behavior
@systemPrompt(`
  Greet the user by their name in a friendly tone.
`)
export class GreetingAgent extends Agent<string, string> {
  constructor(private userName: string) {
    super();
  }

  @systemPrompt()
  getUserName(): string {
    return `User's name is: ${this.userName}!`;
  }
}

// Instantiate and run the agent
(async () => {
  const response = await new GreetingAgent('Alice').run('Greet me.');
  console.log(response); // Output: "Hello, Alice! It's great to meet you! How are you doing today?"
})();
