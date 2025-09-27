---
title: Please Stop Splitting Things
date: 27
categories:
  - informatics 
---
# Please Stop Splitting Things

This article is both aimed at developers and non-developers.

# Introduction

We learn that bundling too many things together is bad, be it writing a huge function or a class file having thousands
of lines.
The same holds true for non-technical aspects such as project documentation, project tickets etc.

We have been thought as junior develops to always avoid the so-called "God Classes", that are huge chunks of application
that seem to do everything.
There are many good reasons to avoid this antipattern, and I will not dive too much into these, since there are tons of
good reads on this subject
(low coupling, single-responsibility, easy testability, etc ...)

## Tipping Point

There is, however, a tipping point, beyond which splitting items into smaller ones becomes less efficient.
Just like many processes in nature, as we increase the input of a system, the returns become diminishing or even
negative. \

One such example is light-to-sugar production in photosynthesis. The more we put light into the system, the more sugar
the plant produces, but the returns are diminishing. At a certain point, the chart tips downwards, since the chlorophyll
is killed by the intense light.

![img.png](img.png)

Another very similar example can be observed with voltage-to-current relation, where after a certain point, we start
seeing diminishing returns until the conductor melts from overheating.

In my opinion, splitting code, or other pieces of information like files, documentation, jira tickets etc behaves in the
same manner.

MAIN:

Cognitive load of having to navigate in a fragmented environment

EXAMPLES:

Too many repositories

Too many microservices

Too many files

Too many tools:

Proposition missing a "single source of truth"
Being too dependent on vendor-specific technologies

The golden rule in development:

Minimise coupling, maximize cohesion, there is a break-even point after which we actually exponentially increase
coupling by fragmenting our application

# Example Writing names in vertical
