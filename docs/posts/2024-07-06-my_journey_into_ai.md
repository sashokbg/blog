---
title: "My Journey Into AI"
date: 2024-06-22
categories:
  - informatics
---

I wanted to write this article after being onboard for some time now on the "AI hype train" as many of us are since the release of ChatGPT 3.5 in late 2022.

Even though I am a "tech-savvy" person and a developer, I quickly bit the bait and started imagining a completely automated world with AI agents understanding everything we want and performing any possible action etc.

This hype feeling was even more exacerbated due to the fact that I am bad at math (and even worse at linear algebra) and I did not have a good understanding of what exactly LLM are and how they work.
I spent lots of my time watching videos and reading articles of authors who seemed to share the same motivation and enthusiasm as me (and probably have the same level of Maths as me).
Most of this content was on what LLMs could possibly do and the "bright future of our race" etc. Many were also being prophets of "Doom AI", the "Dead Internet Theory" and all those "Rabbit AI" holes (pun intended).

I started organizing presentations and talks for my colleagues at work, both tech and business, and was trying to infect them with my motivation for the subject.
I was also trying to shock and scare some of them on how AI would take their jobs. I was blabing about "There will be no UX soon, only prompts with agents", "soon an AI will do what you do in an hour" ... all the typical demoralizing stuff.

![Took our Jobs](../images/state_ai/took_jobs.gif)

I guess I was holding a grudge against my colleagues for not trying hard enough to be better engineers and not being implicated and passionate enough about their work.
But I guess this is a story for another article.

So to put it simply the hype train was in full speed and I was riding on it.

## My Path into AI

I am a Java / JS engineer with 12 years of experience with a heavy imposter syndrome due to being a drop-out. Whenever a new thing in IT becomes relevant and popular, my initial reaction is almost always to worry about being too dumb to understand it. 
It naturally took me some months to gather the courage to start researching and experimenting with this new technology (GPT-3.5). I was feeling very overwhelmed and intimidated due to my lack of education and understanding of the matter.
I started with very simple things like simply running a model on my rig at home and doing some simple inference. 

This is the moment to send an enormous thank-you to the creator of [llama.cpp](https://github.com/ggerganov) whose work allowed me to start playing around with LLMs in the first place! Llama.cpp is a C++ implementation of the inference models initially for Llama but then evolved into supporting many other models. It basically allows you to run inference models on your local machine with limited hardware and even using your CPU.

Running the model locally was very useful and helped me to understand better how it all worked. (I love running things locally and playing around - just like debugging)

I was thrilled to be able to run "intelligence" on my home mid-tier gaming computer!

## Chatbots

So there was I, an LLM running on my machine, the prompt awaiting my message, fingers itching and awaiting to communicate with this "entity".

And then.. the first disappointment. Instead of wisdom and intelligence, the output of my "AI" was what I can describe as "a soup of almost random sentences and words".
Also, I was running the model in "raw mode" and it actually wasn't even a chat bot but just an inference tool (text completion tool).
In order to make it behave as a chatbot, we need to tell it to stop at a given keyword and wait for more input.. So was that a "bot"?
Just predict some words and hope the bot writes "user:" at some point and just break so that we can insert more text ?!

It was at this moment that I realized what exactly an LLM is - a model that "simply" predicts the next word and outputs the most probable output. [^oversimplification]

I felt a little cheated!

## Retrieval Augmented Generation

One of the major limitations of LLMs is the lack of external knowledge. The model will only "know" about things that it learned during its training and will not be able to provide you with any fresh information of the real world, or even worse, it will hallucinate about it. (We will talk about that in a later chapter.)

So after some digging, I found out that there is a technique called Retrieval Augmented Generation (RAG). Yet another fancy scarry sounding name.
I was hesitant for more than a month to tackle it, fearing that it will be too complex and difficult to understand.
Oh boy, was I in for a surprise!

It turns out that the scarry RAG was as plain as "manually perform a search, inject the result in the conversation with your AI and hope it properly infers some meaningful response !"

This felt like TOTAL cheating !
How can it be an "intelligent entity" if it is me who gave it the answer to my questions in the first place !?

## Function Calling

Fast-forward a couple of months, and I was already integrating my first AI assistant POC in a small internal project at work.
I wanted to test an LLM technique called "function calling".

To quickly explain it: while performing inference, we provide an additional context to the model in the form of function descriptions (typically JSON schema).  
The model can then choose to call one or more functions from the provided list in order to obtain additional information and answer your question.
This technique looked like a better version of RAG, but with the added benefit of allowing my "AI assistant" to also perform actions since we can put whatever code we like in a function.  [^function-calling]

Things were going well, and the model was doing a quite decent job at guessing when it needs to call a function.

However, reality struck again.

My application's core feature was to track project activities and one of the main requirements for the robot was to properly handle human date manipulations such as "From last Friday to next Monday" or "Second Monday of next month" etc.

Sometimes the robot would understand simple human dates, but it would often fall short whenever a more complicated example was encountered.
This resulted in a long ping-pong conversation between the agent and the user trying to explain when exactly is "Last Friday".

In other words, LLMs are bad at math and problem-solving. I know that there are lots of examples of GPT4, Mistral and Llama 3 doing some arithmetics, but it is done using so many calculations and power consumption that I consider it utterly inefficient and thus not a viable solution.

Since dates were a very important part of the project, I ended up instructing the "AI" to just show the user a date picker input whenever it thinks date arithmetics needs to be done.

I felt cheated once again!

## Hallucinations

As we have mentioned previously, one of the banes of LLMs is hallucinating.

Hallucinations are caused by the very nature of how these models work. They try their best to predict the following word and sentence without having any real knowledge if the result is a true fact or not.

I worked on another POC where I wanted to create a smart assistant for a trading website. The robot's task was to answer various questions about e-trading, mainly using information from the site's FAQ page.
Hallucinations were very dangerous since the robot would happily tell you that you can send money for free abroad when in fact it was completely the opposite.

To resolve the issue, I had to do some more advanced RAG using vector databases and embeddings searching in combination with advanced prompt techniques like "few-shot prompting".

Even then the assistant would hallucinate some wrong information every now and then, so I ended up including a link to the (hopefully) relative FAQ page in each answer, hoping the end-user would be cautious enough to do their fact-checking!

So was my "AI" intelligent or was I just using lots of oversized tools to create a glorified full-text search engine?

This felt like cheating!

## Prompt Engineering

The POC in the previous chapter led me to discover the world of prompt engineering.
Yet another scary sounding term that ended up just not too hard to understand.

To sum it up in a few words it consists of inserting the right amount and type of context information (just pasting your text in the prompt) in order to nudge the probabilities of the output that you need being generated. 

There is a great site that consists a collection of prompting techniques that you can check [https://www.promptingguide.ai/](https://www.promptingguide.ai/)

I also discovered a very interesting framework called LMQL [^LMQL] that allows you to do lots of advanced prompt engineering techniques.  
On their showcase page they have an example of how, using the right prompt, you can make a relatively primitive LLM model solve math problems.

The issue was that the prompt was so tailored to the given problem that I could hardly see how this could be used in a more generic situation.

Once again, if the model is "intelligent," why do I need to give it almost every step of the solution in a procedural style? Isn't this the definition of an algorithm? Why not just write the code by myself?

I felt cheated!

## Shift From Boolean Logic to Probabilities

As of writing this article, there have been many improvements in the LLM landscape. Llama 3, GPT-4o etc.
Most of these models are getting better and better at a broader range of tasks.

However, they all share the same flaw related to their probabilistic nature. We are unable to guarantee with a high level of certainty that a model will always behave the way we want it.  
Even setting the temperature to 0 [^temperature] will not always yield the results we want since changing even one character in the prompt will scramble everything.

As an engineer I cannot feel anything but dread at the concept of having a system that "sometimes, randomly does not work and is almost impossible to debug".

I feel that there is a statistically high chance I got cheated again!

## Microsoft AI Tour

As a Linux / Free Software enthusiast, it is needless to say I am not a huge fan of M$, but even the "bad guys" can sometimes teach us a thing or two.  
I attended the Microsoft AI Tour in Paris in March 2024 and their main presenter (technical engineer) was actually the person who inspired me to write this article.

One of the phrases they said that caught with me was: "LLMs (ChatGPT) are just word calculators, don't try to make them do more than that, you must narrow and limit their responsibility as much as possible."

The engineers at Microsoft even developed a pipeline-like tool for LLMs called promptflow[^promptflow]. The main idea is that since LLMs are struggling with many tasks, you need to chain lots of small tools such as custom scripts, multiple models calls and even mixing different models in order to obtain better results.

Also one of the main features of this framework are the evaluation flows that act as a sort of unit tests. These evaluation flows can verify that your entire pipeline, not just the model, behave in a certain way. You can evaluate it on things like Groundedness, Relevance, Coherence, Fluency etc. [^evaluations]

This was the moment I started understanding how exactly I, as a developer, could properly use LLMs in my programs.
How I can limit their negative behaviors, properly frame the solutions and incorporate them in a repeatable and testable environment.

No more cheating.

## Summary

It may feel like I am downplaying and criticizing the capabilities of the LLM models in this article, when in fact I continue to be amazed and very passionate about the possibilities that they offer us.
I wanted to include a healthy dose of reality check and grounding in order to see through the veil of hype that is used so very often by ill-intentioned actors for their own benefits.

The way I see this new "AI era" is that it provides a level field for smaller actors like me and my company.
Data, computing power and their related tools, that were once the luxury of only the biggest and richest companies are now in the hands of everyone.
Once we needed a full team of data scientists, expensive hardware, cloud subscriptions, all of which cost hundreds of thousands of dollars, often with very mediocre results and outcome. Now we only need a $10 OpenAI subscription.

I can easily create from my bedroom a chatbot as performant as the once that only Amazon or Apple could afford.
I can use computer vision to create new interesting products and solutions where once only Nvidia had the resources to do so.

Also, I stopped using the word "AI" but rather prefer "models" or ANI depending on the person I talk to.

Thank you for your time.

## Notes

[^oversimplification]: This is, of course, an extreme over simplification. If you want to learn more on how GPT models work, you can watch this great video by 3blue1brown - [https://www.youtube.com/watch?v=wjZofJX0v4M](https://www.youtube.com/watch?v=wjZofJX0v4M)

[^function-calling]: There is a model that works pretty well for function calling called Functionary that you can check [https://github.com/MeetKai/functionary](https://github.com/MeetKai/functionary).

[^LMQL]: You can check [LMQL here](https://lmql.ai/docs/language/tools.html#calculator)


[^temperature]: Basically lower temperature means lower variation of outputs.

[^promptflow]: The promptflow tool is developed as an open-source solution by Microsoft (yes we live in such times !). You can check the repository here [https://github.com/microsoft/promptflow](https://github.com/microsoft/promptflow)

[^evaluations]: [https://learn.microsoft.com/en-us/azure/machine-learning/prompt-flow/concept-model-monitoring-generative-ai-evaluation-metrics?view=azureml-api-2](https://learn.microsoft.com/en-us/azure/machine-learning/prompt-flow/concept-model-monitoring-generative-ai-evaluation-metrics?view=azureml-api-2)

