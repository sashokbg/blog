# The Pitfall of CRUD Based Development

I wanted to write this article about an obvious anti-pattern that I keep encountering over and over again in my carreer. It is sort of related to the anemic design anti-pattern but on a scale that is beyond the development part of a project.

We are talking about how Business Analysists / Product Owners (or whatever we call them by the time you read this article) describe business requirements and user stories. Maninly how this description is mostly based on the CRUD operations and on CRUD user interfaces omitting in many cases the true invariants and capabilities of the system.

At the end of the day if we only need CRUD screens, a database and a simple table-like interface are more than sufficient. Even an excel sheet or MS Access project can do the job for a fraction of the price.

## Let's dive in a quick story
Back in 2018 the company I worked for, won a big project for an international transport company. We had to completely redevelop their whole bus and drivers schedule system. We are talking a project of 15 developers split into 3 feature teams working for more than a year.
I was thrilled to put in place all the DDD practices I had just recently learned. The project seemed perfect for it - lots of complex business rules that can perfectly be described by a domain model and developed in TDD and BDD.

Initially we rode high on the hype curve and proposed to our client UI UX analysis with all the cool stuff like User Journey, Personae, Pain Points etc. We even sent two UX specialists abroad to talk with drivers and dispatchers in order to better understand the needs of the final user and so on. What could go wrong you ask ?
CRUD SCREENS ! That's why !

Our product management had the brilliant idea to start developing the application not from its core business value, which is of course the calendar and driver schedule, but from the administration and couple of "revamped" screens for the bus driver that didn't actually add any new features, just "UI improvements".

We spent many sprints developing "screens" for "admins" that did nothing more than read / write data directly into a table. The very few business rules we had to develop were related to data validation etc. End of sprint demos did not show any real system capabilities, just pretty screens.

## DDD and BDD Extend Beyond Development

In my opinion of the reasons why this problem occurs is that for some reason DDD and BDD are considered mainly developer disciplines. It becomes impossible to properly develop complex software with rich business rules if from the very beginning everything is only described as CRUD screens. A true life invariant "garbage in - garbage out" !


 product owners most of whom used to be "project managers" or even the more prestine sounding "chef de projet" somehow don't seem to be interested in learning better ways 

A quick story: 
