---
title:  "Generating Product Descriptions with LLMs"
date:   2026-05-23
authors:
  - kirilov
categories: 
  - informatics
---

# Generating Product Descriptions with LLMs

In this article I want to share some experience I gained while working on an AI-powered, software whose purpose was to generate description for products on e-commerce platforms.
We initially started working on it as a full-blown product, but later scaled it down to a n8n integration pipeline, due to the fast pace at which the technology is moving.

<!-- more -->

## Lockdown & E-Commerce

The story starts around 2019 when we were all in Covid lockdown, and while small retail shops were closing doors, e-commerce and online shopping were thriving.
Platforms that received only a small amount of monthly orders on their internet channel, were now having their entire business revolving it.

Product's descriptions were suddenly more important than ever, in order to be visible on the search engines and writing these description started to take even more time.
Imagine being a fassion retailer, having two collections per year of around 10 000 products. Even spending as little as 2 minutes per product will take you more than 300 hours per year writing only product descriptions. Not to mention how tedious and repetitive this task can be.

Another issue with the e-commerce pipeline comes from the multiplication of actors. Editorial team writes the description, legal team makes sure we have no copyright issues, photographers do photoshoots, factories provide technical description etc.
Each link in this chain can potentially introduce errors in the final description and reviewing the entire chain becomes difficult and cumborsome.

Some haute-couture retailers have a very strict tone of voice and description rules to respect, which were previously only known to a few members of the core team. Now these rules need to be synthesized and communicated to other members of the team or even third parties.
Translating the tone of voice into various languages can also be very challenging due to language barriers and particularities.

## AI - The "Miracle" Solution

Chat GPT 3.5's release in 2022 marked a turning point in the IT world. It was a giant leap forward in generative AI, unlocking all kinds of possibilities. From writing emails, categorizing text, to source code editing. AI started looking more and more like a real assistant, capable of helping in day-to-day tasks.
The inevitable question comes to mind, why not use gen AI to generate the descriptions for my products ?

And this is exactly where our journey led us.

## A not so "Miracle" Solution

Let's start with the most simple and naive way of generating product descriptions: just use RAG to include the raw (technical) description of the article as well as couple of photos and a prompt telling it what to do.  
At first glance this works nicely, specially given the fact we were all under the hype influence of the newly emergeant technollogy.  
Unfortunately, just like any tool, AI also has its limitations and its right and wrong usages.

Hallucinations, out-of-date and limited knowledge of the real-world data, problems following multiple guidelines, "generic" look & feel of the description, laque of integration with other tools. These are some of the challenges that immediately become evident when we started work on our "Product Description Agent".  
It was obvious that we needed to put the LLM into a well-defined frame, and make it work on small and precise tasks, one at a time. Just like a real person, when presented with too many things, the AI agent became less-precise and less productive.

Our architecture choices were governed by the aforementioned problems and limitations. Let's break them down one-by-one.

## Avoiding Context Overload

When we generate a description for a given product, we only need to specify instructions for that product's family and not our entire catalog. The solution we opted for is to run a classification step, before the LLM generation step, in order to load the appropriate instructions for the model.

To make this work we needed to create embeddings database with the required product families and link a prompt instructions file to each category, that gets loaded only when a product is identified.  
I will not delve too much into the technical details, since Vector DB RAG is very well-documented subject, but what is important is that this initially approach lead us to define an important principals for our LLMs:
q
- Do one thing at a time
- Load the minimum necessary context for the job

## Hierarchical Prompts

Classification and dynamic prompt loading worked well initially, but we stumbled upon another problem. Often times instructions would have a hierarchical nature, where some generic instructions are applied for a parent family and more specific detailed instructions are applied to the sub-families.
An example might be "All Jeans are described as sturdy", but the sub-family of "Elastic Jeans" are also described as "Comfortable".

A simple algorithm allowed us to solve this problem, by using wildcards in the file names like: jeans.*.*.txt meaning "jeans" and all its sub and sub-sub categories.

## Product Family Schema

When describing an article there is a certain set of features that are more important than others. When looking at a pair of jeans, the model might tell us, the color, the size but miss some important distinctive features, that are not typically described in jeans, like "eco-friendly". To make sure the AI focuses on the list of features/properties we like, we used a JSON schema, associated to each family of products.
After the JSON schema is loaded, we use a technique called "function calling" to ask another model, to fill in the property values for the current product.

Another advantage of the usage of schema is to enforce specific domain terms. Think of artistic colors like "Moss Green", "Glacier Blue", "Naples Yellow". To make sure the model uses these terms for a specific set of products, we can write them as an enumeration within our product's schema.

## Content Generation

Thus far we have categorized our product, loaded the family prompt instructions, loaded the family properties schema and extracted the values for the schema. We now can package this entire suit of data into the context of another agent and proceed with generating the content.

As expected, we immediately observed huge improvements in accuracy and hallucination reduction. With well-structured and prepared aforehand data, the model would easily follow instructions and produce articles that look very close to real descriptions that our client at the time sent us for comparison.

## Article Blocks

The tone of voice and general "feeling" of the articles were improving, but we still had issues with formatting. Sometimes we needed to instruct the LLM to generate certain number of bulletpoints, use a given number of words in a title etc, or split descriptions in paragraphs.
We used few-shot, chain-of-thoughts and other prompt engineering techniques. The issue we faced is that often times instructions about one part of the article would interfere with another.
To meet the needs of one potential client, we needed to fine tune a model to write the long descriptions for products. Unfortunately, the fine tune messed with the quality of the other parts of the article.

To, now obvious solution, was to split the article into blocks and configure a specific prompt for each one. We also added a per-block LLM configuration, allowing us to use fine-tune models or even mix and match different versions and flavours of models (GPT, Gemini, Mistral etc) with limited side effects.

The blocks allowed us to reduce even further the amount of instructions sent at a given time and allow the AI model to concentrate at one task at a time, making generations precise and focused on a small scope.

## Translations

After the content of the article was created, we needed to translate it into various languages. We applied the same general principal of "do one thing at a time" and provide a dynamic "minimum of instructions" for the model.
We created a prompt configuration for each language, feeding it to the robot only when it was time to translate into the given language.
This allowed us to configure specific phrases, keywords, word substitutions per-language.

## Anomalies Detection

As we mentioned earlier, with the increase of sales on e-commerce channel, also increased the number of mistakes and errors.
One of the strong sides of generative AI is it's feature to understand semantic meaning and perform classification. With these two tools we could easily instruct a model to detect certain types of anomalies like mixed-content, gibberish descriptions etc.

This feature was especially useful for e-commerce actors who are offering platforms for other selleres (B2B) and want to make sure that the content published on their platform would have some minimum of quality and follow some basic rules.

## Technology Pace & N8N

When we started working on this project in early 2023, the AI wave was still in its early phase and we had to build many tools by hand. MCP, model skills, AGENTS.md and tools like these did not exist or were too young.
Workflow-style tools were still not "AI-ready" and N8N was in beta. Langchain was less than a year old and most APIs were evolving fast.
Even well-established API references like OpenAI's REST format were still not stable.

We were wasting a ton of time developing state-machine like algorithms, nodes, parallel execution, error handling, instead of focussing on the AI and business features.

Technology was evolving so fast that in mere months large chunks of what we wrote by hand would become obsolete.

We eventually settled to abandon most of our codebase and migrate two-thirds of our code to N8N, keeping only some backend and admin features.
This allowed us to easily prototype and update things without having to write lots of code.
Another benefit was also the visual presentation that speaks a lot to non-technical savvy people. We could also plug in all the existing N8N integration nodes like Google Drive, Teams and even export to Shopify.

## From a Product to an Integration Toolkit

We initially dreamed big and wanted to release a full-blown product, but as time passed more and more obstacles would appear before us.
From client's skepticism and anti-AI pushback, to overinflated expectations and hype, coupled with completely inexistent production integration. Our team was having a hard time convincing retailers to buy or invest in it.

Never the less, we gained more and more realistic view of what generative AI can do, but also what it cannot. We saw both potential and limitations.
We gained inspiration for many AI-augmented use cases, based on what we developed and created around the "product description agent". We even reused some parts of its pipeline to create other smaller projects.
With the knowledge we obtained during this great experience, we started a training course around the usage of generative AI for both technocical and business personnel.

We finally lead us to change our mindset from a "product team" to an "integration team". Instead of trying to create a one product that fits all, we now offer a service of integration and adaptation of existing processes with AI. 
Just like in the 2000s we were "digitizing" the business process, then in the 2010s we were deploying "move to cloud", we now live in the "move to AI" era.

















