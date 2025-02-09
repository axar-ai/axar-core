import { model, systemPrompt, Agent } from '@axarai/axar';

// FIXME: Support boolean output
@model('openai:gpt-4o-mini')
// @validateOutput(SupportResponseSchema)
@systemPrompt(`Respond in one line`)
export class ConversationAgent extends Agent<string, string> {}

@model('openai:gpt-4o-mini')
// @validateOutput(SupportResponseSchema)
@systemPrompt(`Respond with a joke`)
export class JokeAgent extends Agent<string, string> {}

async function main() {
  const cAgent = new ConversationAgent();
  const jAgent = new JokeAgent();

  let result1 = await cAgent.run('Who was Thomas Edison?');
  console.log(result1);

  let result2 = await jAgent.run('Who was Albert Einstein?');
  console.log(result2);

  let result3 = await jAgent.run('What was he famous for?');
  console.log(result3);

  let result4 = await cAgent.run('What was his most famous invention?');
  console.log(result4);
}

if (require.main === module) {
  main().catch(console.error);
}
