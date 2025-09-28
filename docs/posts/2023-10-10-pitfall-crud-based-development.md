---
title: "The Pitfall of CRUD Based Development"
date: 2023-10-13
authors:
  - kirilov
categories:
  - informatics
---

# CRUD-Based Development

I wanted to write this article about an obvious antipattern that I keep encountering over and over again in my career. It is sort of related to the _Anemic Design Anti-Pattern_[^anemic_design] but on a scale beyond the development part of a project.  
_It also turns into a cocky semi-rant at the end (you have been warned)._

<!-- more -->

We are talking about how Business Analyst / Product Owners (or whatever we call them by the time you read this article) describe business requirements and user stories. Mainly how this description is mostly based on the CRUD operations and on CRUD user interfaces, omitting in many cases the true invariants and capabilities of the system.

At the end of the day, if we only need CRUD screens, then a database and a simple table-like interface are more than sufficient. Even an Excel sheet or MS Access project can do the job for a fraction of the price.

## Let's dive into a quick story
Back in 2018 the company I worked for won a big project for an international transport company. We had to completely redevelop their whole bus and drivers schedule system. We are talking about a project of 15 developers split into 3 feature teams working for more than a year.  
I was thrilled to put in place all the DDD practices I had just recently learned. The project seemed perfect for it - lots of complex business rules that can perfectly be described by a domain model and developed in TDD and BDD.

Initially we rode high on the hype curve and proposed to our client UI UX analysis with all the cool stuff like _User Journey_, _Personae_, _Pain Points_ etc. We even sent two UX specialists abroad to talk with drivers and dispatchers in order to better understand the needs of the final user and so on. What could go wrong, you ask?  
CRUD SCREENS! That's what!

Our product management had the brilliant idea to start developing the application not from its core business value, which is of course the calendar and driver schedule, but instead from the administration which is mainly CRUD. We also included some "revamped" screens for the bus driver that didn't actually add any new features, just "UI improvements".  
All of the hard work put by the UX team served for nothing and was quickly forgotten in a sub-sub-sub-subdirectory of some Google Drive.

We spent many sprints developing "screens" for "admins" that did nothing more than read / write data directly into a table. The very few business rules we had to develop were related to data validation. End of sprint demos did not show any real system capabilities, just pretty screens and CRUD.

When the real business logic arrived eventually, our team was completely unprepared. Instead of gradually improving our insight of the core business domain, we learned nothing during the initial 5 sprints. Our team had developed a model that is not at all relevant to the functional rules. Chaos ensued and we had real hard time adjusting our CRUD model to accommodate all the complex business logic that arrived.

Had we started with the core domain, things would have been a lot easier, albeit delivering a little less "pretty" screens.

## Another Story
I am currently working at a banking software project for our company that aims at corporate clients. It delivers a complex set of features that allow a corporate user to delegate responsibilities to users in companies within their corporate group.

We are talking about things like maker-checker workflows and so on.  
Some of the workflow validation includes complex business rules like the number of transactions per month, or even an expression language for specifying required validator roles.

One would think that when describing such a complex feature, we would start by showing the business value it provides, or even giving a use case scenario from the perspective of the final user. Or just maybe an old and bland description of how the workflow logic works?  
No, no, no, *CRUD* is what you get, dear junior developers!  
Screen upon screen of "this is how you add a new validation rule", "this is how you delete it", not even a paragraph explaining WHY we do this, and WHO it benefits.

Things were so bad that some developers who worked for months on these features had no idea what exactly it was for.
One developer even told me, "Why did no one tell us such a use case ?" when I described in simple terms how I understand the feature. 

## DDD and BDD Extend Beyond Development

In my opinion of the reasons why this problem occurs, is that for some reason DDD[^ddd] and BDD[^bdd] are considered mainly developer disciplines. It becomes impossible to properly develop complex software with rich business rules if from the very beginning everything is only described as CRUD screens.  

Product owners, whose voice is for some reason always better heard, seem to get obsessed by the screens and CRUD part of the software. Maybe because they do not understand what a good software solution has to deliver, maybe because they do not wish to improve their knowledge of how good software is made, or to understand what the core business value of the project is.

Another issue, in my opinion, is that architects and tech leads are rarely consulted during the initial phases of the project. We often end up in a very V-style cycle, although we all boast about being as agile as circus acrobats. Instead of true agility, we apply a sequence of actions that follow some sort of "chain of command".

First and most important are Commercial Agents - they are the brains who found and sold this great project at an unreasonably low price with impossible deadline and promises as ridiculous as Alice in Wonderland.
Then come Business and UX Analysts who do their job in complete isolation from the development team - we don't want any technical guys mingling with those pretty Story Mappings, do we now?

Then come Project Managers / Product Owners (notice the important words _MANAGER_, _OWNER_). They proceed to carefully create a couple of hundred CRUD tickets in Jira, thinking those are perfect "User Stories". Once again, we are not onboarding any development team - they are too busy doing other things, we don't want to waste their time!

And finally, when all the important people above have finished their tasks, the _ouvriers_[^ouvriers] can start typing on those keyboards.

Your poor junior with 2 years of experience cannot understand what a "Bundled Corporate Transaction Workflow Step" is?

Here, read some CRUD specifications to help you out...

And the only true invariant respected in the produced code is: "garbage in - garbage out"!

## Notes and References

[^anemic_design]: [Anemic Design Anti Pattern](https://martinfowler.com/bliki/AnemicDomainModel.html)
[^ddd]: [Domain Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
[^bdd]: [Behavior Driven Design](https://cucumber.io/docs/bdd/)
[^ouvriers]: Manual workers Fr. tr.
