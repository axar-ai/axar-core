import { model, systemPrompt } from "./decorators";
import { Agent } from "./agentx";

@model("gpt-4o-mini")
@systemPrompt("Be concise, reply with one sentence")
class SimpleAgent extends Agent<string, string> {
  // It will do
}

async function main() {
  const response = await new SimpleAgent().run(
    'Where does "hello world" come from?'
  );
  console.log(response);
}

main().catch(console.error);
