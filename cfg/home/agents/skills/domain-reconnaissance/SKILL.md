---
name: domain-reconnaissance
description: Domain reconnaissance exposes authoritative constraints around a high-cost design decision. Use before settling architecture, interfaces, data ownership, deployment, security, or operational boundaries that depend on an unfamiliar platform or protocol; also use when implementation or review uncovers a load-bearing assumption that could invalidate the settled design.
---

# Domain Reconnaissance

Research one decision, then hand it back to the caller. This is a decision-support primitive, not a planning or implementation workflow.

## Trigger

Run when at least one signal is present, either during shaping or by reopening shaping from implementation or review:

- A missing domain fact could create a **complexity cliff**.
- The choice is costly to reverse across an interface, data model, deployment, security boundary, or operating model.
- Correctness depends on an external platform, protocol, or ecosystem whose semantics are not established locally.
- Authoritative sources, project assumptions, or agent recommendations conflict.
- Implementation or review exposes evidence that contradicts a settled design, spec, or ticket.

Routine, reversible work stays in the caller's normal flow.

## 1. Frame the decision

State:

- **Decision** — one question this run will inform.
- **Product intent** — the user-facing outcome and constraints the design must preserve.
- **Trigger** — the signal that justified reconnaissance.
- **Assumptions** — the load-bearing beliefs already guiding the proposed direction.

When reopening shaping, name the settled decision and downstream work now in doubt.

Treat product intent as a constraint, not as proof of a technical design.

Completion criterion: one decision, its boundary, its trigger, and every known load-bearing assumption are explicit.

## 2. Load project evidence

Read the nearest agent instructions, domain glossary, relevant ADRs, originating issue or spec, and the code at the proposed seam. When implementation or review triggered the run, inspect that evidence too. Follow project pointers to a knowledge base narrowly when they own relevant context. Resolve discoverable facts from these sources instead of asking the user.

Completion criterion: every local constraint and prior decision that could change the answer is accounted for; contradictions are listed.

## 3. Research authorities

Research only the domain gap. Prefer primary authorities in this order:

1. Standards, specifications, and official documentation.
2. Upstream source code and tests.
3. Official design proposals, release notes, and issue trackers.
4. Research papers and reproducible benchmarks.

Cite every material external claim near the claim. Label inference as inference. Mark facts that remain unsupported as `unverified`.

Completion criterion: every material constraint has evidence or an `unverified` label, and the remaining unknowns are explicit.

## 4. Pressure-test the options

Compare the viable options against the same axes:

- fit with product intent
- domain correctness
- reversibility
- implementation and operational complexity
- scalability, reliability, and security consequences
- failure modes and observability

Hunt for **complexity cliffs** and load-bearing assumptions. When documentation cannot resolve an empirical question, name the smallest prototype or experiment that would.

Completion criterion: every viable option faces the same constraints, every complexity cliff is visible, and any required experiment has one precise question.

## 5. Return the decision packet

Return:

```markdown
## Decision
## Product intent
## Authoritative constraints
## Options and tradeoffs
## Complexity cliffs
## Recommendation
## Unresolved evidence
## Sources
```

Include confidence and rationale with the recommendation. Stop at the packet and hand control back: the caller owns the decision, tracker updates, glossary or ADR changes, specs, PMP evidence, and implementation. Wayfinder may persist the packet as a research-ticket resolution; grilling resumes its one-question decision tree with the packet in context. When implementation or review triggered the run, its caller pauses execution and returns the packet to shaping; work resumes after the affected decision, spec, and tickets agree again.

Completion criterion: the caller can make the decision from the packet, or the exact blocker and next evidence are explicit.
