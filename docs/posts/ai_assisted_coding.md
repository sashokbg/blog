---
date: 2025-10-01
title: AI Assisted Coding
authors:
  - kirilov
categories:
  - informatics

draft: true
---

# My Experience with AI Assisted Coding

Let's first define what AI Assisted Coding is:

The HTML specification is maintained by the W3C.


First of all, it is not "vibe coding".
Second, you still have your brain active and really do review, write and contribute code along with your AI assistant.

I first tried AI-assisted coding back in the beginning of 2024 with cursor, but the ecosystem and models were still not
that mature for my taste.

## Initial Phase

It is wise to initialize your project in a semi-manual way. Frameworks often change and the LLM will not automatically
install the latest version of all
dependencies

If using a not very popular framework the risk of hallucinations is increased.

## Working with well-defined architecture.

Observation:
The AI is able to implement well-defined user stories where both business rules and technical documentation have been
provided.

Feeling:

- I am reluctant to allow the AI perform modifications since I feat it will not respect the initial architecture
- I am worried the generated code will be too complex and obfuscated

- Small fixes are often quicker to fix manually, the AI takes too long to evaluation and read things. This is ofc,
  provided you have a deep knowledge of your project.

## Code Considerations

NB: These are probably easy to fix with Agents.md ?

- Variable names are often too short example:
  Ex: m instead of "match", idx instead of "index".
  Ex: LG_EVAL_RC ? LG = Learn Git, EVAL, RC ?

- The code is too "fail slow" meaning that it will perform lots of checks that might hide a bigger problem.
  Ex: user?.account?.name but in what situation should user or their account be null ?

- Lots of useless comments even though instructions in Agent.md were given to not put comments that do not anything
  meaningful

Code consistency is OK in some situations, like when creating a new component, based on an existing one, but is less
optimal, when I ask it to replicate some less-structured code.

## Difficult Bugs

Ex: ShellInABox.js autoscroll
Too eager to write code and try solutions, before exploring the problem.

## Human Interaction

Ranging from the feeling of having an expert at your side, to a complete beginner / junnior who needs to have everything
explained to them.

Has the tendency to agree with you and will very rarely tell you are wrong.

## MCP

Playwright MCP

IDEA: add playwright explications for the robot so that it can easily test by itself

## Token Usage & Context

Through the roof !

The context size looks sufficient.
I observe no "slow-downs" when approaching the limit of the context, which is already rare

## Documentation

Each feature starts by being documented in both technical and business terms by me. After the development cycle I ask
the AI to go back and update the documentation to reflect any changes that were necessary to make things work.
