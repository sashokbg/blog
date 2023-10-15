---
layout: post
title:  "Balcony Watering System"
date:   2023-10-19
categories: informatics
---
# Balcony Watering System


Summer time was arriving and we were all very thrilled to go on vacation. As usual every preparation for the long trip abroad was done in the absolutely last possible moment.

One of the many things in the TODO list was to ensure that our 10 or so house plants survive for 1 month without us watering them. This has usually been done previous summers with the help of friends and with some basic PVC water bottles fitted with a perfusion cone. These things worked more or less, but my geek gut feeling was pushing me to do something more techy. \
Also, the solution didn't scale particularly well since the more pots we added, the more PVC bottles we needed and it was becoming very time consuming to refill them one-by-one.

## Over-complicating It

At first, as most engineers do, I thought of very complex solutions including Arduinos, Rasperry Pi, solenoid valves, switches, moisture sensors, mini lcd displays and so on. But with only one day left before the trip all of this was completely unachievable. There was no time to configure all of this complex setup, wire all the components, write the program and test everything. Adding so many components also increases the risk of failure and failure means dead plants !

I had to think of a real working solution and fast. This situation got me thinking not as a young geek who has all the time needed to tinker and re-do everything, but as a time-constrained engineer who needs things done the right way from the first time and move on with another task.

## Transition to Simplicity

All of this got me thinking in another direction. If my plants were to live, I needed to make compromises and find existing and working patterns that can easily be tested and implemented.

Also one important constraint besides time was that my girlfriend imposed a strict "no water leak" policy. As I think of it it was the safe thing to do. Imagine having a leaking water hose on your balcony for 1 month.. \
This meant no running tap water, which in turn meant I couldn't use tap water pressure so electricity and pumps were still needed.

The stress of all of the above drove me over to the simplicity side of things.

## Solution

Here is the final project along with used materials.

Materials:

- Power supply 12V. You can reuse old mobile phone charger etc. *~10€*\
![Power Supply](/assets/images/watering/power_supply.jpg)

- An aquarium 12v water pump will do fine. *~10€* \
![Water Pump](/assets/images/watering/water_pump.jpg)

- Watering tubes - 8mm or depending on your pump's size. You might need a piece of 8mm inner and 10mm outer to connect both male ends. *~10€* \
![Water Tubes](/assets/images/watering/water_tubes.jpg)

- Programmable power outlet. Take a variant that is programmable to the minute. *~10€* \
![Programmable Outlet](/assets/images/watering/prog_outlet.jpg)

- Container for storing water 

Steps:

1. Plug one end of the tube.

1. Place the tubes along the plants and hold them with some straps.

1. Pierce the tubes with a needle. 3 holes per plant should be enough. If some of your plants are bigger, add more holes, but try to keep predictable hole ratios. Ex 2-4-6 or 3-6-9. \
This will help with calculating how much water your plants are getting.

1. Once all holes are done do a test run by submerging the pump in a measure cup and make it run for precisely 1 minute. Measure the used water. (400 ml/minute in my case)

1. Create a spreadsheet to help you calculate how many times the pump should activate per week and for how long.
![Spreadsheet](/assets/images/watering/spreadsheet.png)
*Example for 6 plants, watered 3 times a week for 2 minutes*

1. Program the outlet, according to the manual and according to your spreadsheet calculations.

1. Fix your pump to the bottom of the container, fill with water and cover it.

## And The Result

|![Water Tank](/assets/images/watering/water_tank.jpg)  | ![Watering Result](/assets/images/watering/watering.jpg) 

Some Additional Tips & Tricks:

- The intake of the pump should be as close as possible to the bottom of the container to suck-in as much water as possible.
- Avoid any debris in the container as they can clog the system.
- Putting a small piece of pipe with two slits at the bottom opening of the pump can help with the above two points.
- Put a marker on your container to help you track water usage. I used a piece of scotch on the outside.
- Test your programmable outlet by plugging a lamp to it.

## Conclusion

Building a safe and reliable watering system for your balcony plants is a fun and useful hobby project that anyone can undertake. \
It taught me a valuable lesson about finding effective and working solutions in time and budget constraint situation. \
Having real stakes at hand forces you to try to predict what could go wrong ahead of time instead of a trial-and-error approach.