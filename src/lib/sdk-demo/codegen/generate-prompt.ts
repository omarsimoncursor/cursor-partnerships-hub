import type { Workflow } from '../types';
import { getAction } from '../catalog/actions';
import { getEvent } from '../catalog/events';
import { getTool } from '../catalog/tools';

export function generateAgentPrompt(workflow: Workflow): string {
  const tool = getTool(workflow.toolId);
  const event = getEvent(workflow.eventId);
  if (!tool || !event) {
    return '';
  }

  const fragments = workflow.actionIds
    .map((id) => getAction(id))
    .filter((a): a is NonNullable<ReturnType<typeof getAction>> => a !== null)
    .map((a) => a.promptFragment);

  const intro =
    `Incoming ${tool.name} event: ${event.name} (${event.severity}).\n` +
    `Payload type: ${event.payloadType}.\n\n` +
    `Execute the response sequence below in order. Containment first. ` +
    `Never auto-merge. Cite evidence for every step in the audit timeline.\n`;

  const body = fragments.length > 0 ? '\n' + fragments.join('\n') + '\n' : '\n';

  const footer =
    `\nSafety contract:\n` +
    `- Any history-purge PR must remain DRAFT and is never force-pushed by the agent.\n` +
    `- All changes to main require human review.\n` +
    `- Emit one structured audit event per action taken.`;

  return intro + body + footer;
}
