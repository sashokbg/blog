---
layout: post
title:  "Making a Cloud at Home - Part 1: Hardware"
date:   2023-11-14
categories: informatics
---

# Clouds are For Everyone

*Part 1 of 3*

We all have heard of the "cloud", this new promising compute power that provides out-of-the-box solutions and seemingly endless storage and scalability. IT specialists and regular users alike, we all have used it in one form or another - streaming services, cloud computing, file storage etc.

Chances are that the "cloud" we all have in mind is related in one way or another to a {% glossary GAFAM %} company. \
It almost feels like a marketing stunt that aims at making everyone think that the cloud is something solely and exclusively dedicated to those big corporations. We can easily start thinking that it is completely out of reach for a private individual to own their own cloud.

Therefore a challenge was born in my mind: gain a bit of independence in such a corporate-ruled world and have a tiny cloud of my own here at home.

I will try to mostly keep the scope of this article on the technical aspect of things and leave the "freedom vs big corporation" part to the side.

So with no further ado let's make it rain !

## Defining the Needs

When we talk about a cloud we can mean many things. Starting from the *end-user* apps like iCloud, Google Drive, Drop Box and so on, to developer specific {% glossary IaaS %} and {% glossary PaaS %} like AWS, GCP and Azure.
So to make it clear what I wanted to accomplish, I composed a list of requirements for my home cloud that looked something like this:

- Have a user-friendly file managing interface similar to Google drive.
- Host multiple static websites such as a blog or portfolio with various domains (for me and my family)
- Have a reliable storage with some level of redundancy (not aiming to equal Google Drive nor Dropbox of course).
- Perform regular backups to an outside platform, while still keeping a high level of privacy.
- Make everything "as code", being able to automate, reproduce and reinstall at will.

## Overall Architecture

For the architecture of the home cloud, I have decided to create a Kubernetes cluster on bare metal machines which would give me much flexibility on scaling, running containers and having tons of online resources to use such as helm charts, operators and others.
Kubernetes is also very mature at this point and becoming a standard in cloud operations and is even the driving force behind "Cloud Native Computing"[^cloud-native].

To run a Kubernetes cluster however is not a trivial task and I had to make lots of compromises that, many would argue, are not in the domain of the "good practices". One such compromise is that my control plane and worker plane overlap partially and that the control plane is not configured in High Availability mode.. but I am getting ahead of myself.

### Choosing the Right Hardware

I needed in theory at-least 2 machines to be able to call my cluster a cluster. My initial idea was to use Raspberry Pis since I knew that Canonical (the company that makes Ubuntu) had released a special and optimized version of {% glossary K8s %} for ARM and Pi in particular, called *microk8s*. \
The Raspberry Pi seemed to fit perfectly my needs: small form-factor, low power consumption and being affordable.

This was all fine except that the last bit had completely changed since I last bought a Pi in 2017. \
After the pandemic hit, most of the Pi 4s were bought out by scalpers and I was unable to find an 8Gi version for less than 200 euros in France!
When I saw that ridiculous price, it made me open my eyes to some other major issues that the Raspi had: \
Bad power supply, SD card storage, no SATA nor M.2 socket.

The "quick and easy" decision turned out to be nothing of the sort.

### Back to x86

After a quick search on the local second hand e-market websites, I found out that there lots of mini PC's such as the Lenovo ThinkCenter M Series[^lenovo-m], HP ELITEDESK 800 G2 DM[^hp-elite-desk], Intel NUC[^intel-nuc], Asrock DeskMini and others.

All of the above mentioned have a Mini STX form factor of just 14 by 15 centimeters, low energy consumption of 35 to 65 Watts and a full blown x86/AMD64 architecture with real SATA 3 hard drives, M.2 SSD slots, 8 to 16 Gi of DDR3 RAM and so on. All of these specs just blow away the Raspberry Pi in terms of dollar-to-compute ratio.

So to keep things short for you, I bought 2 bare-bone PCs from Asrock - DeskMini A300 (AMD Ryzen)[^asrock-a300] and a 310 (Intel i5 9th gen)[^asrock-a310] with one Lenovo M Series[^lenovo-m]. \
I previously also had an HP EliteDesk but I ended up damaging it while opening / closing and this is one of the reasons I prefer the Asrock DeskMini's since they have a little bit more room inside as well as 2 HDD's and feel more robust in general.
Each of the Mini PCs was either second-hand and/or refurbished and cost me around 200 to 220 euros. I also reused some old components from an old PC like a CPU I had lying around and some SSD drives from retired laptops.

### Storage

As for the storage I immediately thought of a Network Accessed Storage (NAS) such as Synology or QNap. Since I was building my own cloud, I did't need any extra features that the NAS offers except for RAID configuration and data redundancy. 

The cheapest and most adapted NAS for my needs seemed to be the QNap TR-004[^qnap] which is actually not a **N**AS since there is no **N**etwork part in it but a **D**AS - **D**irect Attached Storage.
It is actually hooked up to a PC using a fast USB-C 3.1 cable.

The rest of the storage was each of the machine's own SSD drives that are used for running the cluster's software. Only the DAS storage is used for user data and backups (more on that in the next chapter).

I used a recommended "NAS friendly" drive from Western Digital - the WD Red. I bought 3 drives of 2TiB for the 4 slots of the drive since I was short on money at the time of working on this project. \
Configuring for RAID 5 gave me a total of 4TiB of usable space and a 1 drive failure tolerance. As I said back in the beginning of the article - I do not aim to be Google-level of data integrity so this was mostly ok for me.

*SIDE NOTE:* The WD Red drives are supposed to be optimized for NAS usage, whatever that means, but I had the unfortunate luck of getting a disk failure on one of the disks only after 1 year in service. The disk was completely unreadable and I had to replace it as part of the manufacturer's guarantee which took more than 4 weeks and lots of calls after they just "forgot" about my case.

### Networking

For the network I used the well-known TP-Link ARcher 1750. One of the main factors I considered while choosing it, was that it supports well OpenWRT. OpenWRT is a Linux based router OS that allows you to take full control of your device and configure virtually everything. There also numerous plugins written for OpenWRT that can be installed with a single click etc.

Here in France the ISPs force you yo use their proprietary routers which are frankly a joke in terms of configuration options and speed. \
One major issue I had with the default router from the ISP was that it did not properly route when I was trying to reach my site from within the local network when trying to go through the public IP address. Essentially I could not access my home cloud when I was at home ..

This was a big "no-go", so I had to ditch Orange's Livebox and replace it with my TP-Link with OpenWrt.

Thankfully there is a great tutorial on Github that explains how to do precisely that (credit to ubune[^livebox-openwrt]).

## The Final Look

After acquiring all my material and putting everything together here is how the "cloud" looks at home. \
It takes only the size of a small coffee table top.

![The Home Cloud](/assets/images/homecloud/home_cloud.jpg)

## Taking a Step Back

Let's reflect for a minute on why all of this instead of just using a commercial NAS ? \
Synology and QNAP NASes provide most of the functions that I wanted initially and to be honest I thought about it a lot. Some of the more advanced pieces of hardware can even run containers, opening the door for even more freedom.

My problem with these "commercial" solutions however is that they have a low "bang-for-buck" ratio - slow CPUs, little memory etc.

Also I wanted to reuse some old hardware and give it a new life instead of just buying something new. I am not a particularly "green" person, but even I agree that e-waste is a big issue and I get frustrated at how much good computers get thrown away for nothing. 

Lastly, but this is the most important part, if I did use an "out of the box" solution I would have learned little-to-nothing about how hard, but also fun, it is to host your own things. And this last bit is a true game changer! Taking this journey actually helped me advance my career and become a DevOps engineer besides being a Web Developer !

*END OF PART 1 of 3*

## Notes and References

[^IaaS]: https://www.redhat.com/en/topics/cloud-computing/what-is-iaas
[^PaaS]: https://www.redhat.com/en/topics/cloud-computing/what-is-paas
[^cloud-native]: https://www.cncf.io/about/who-we-are/
[^intel-nuc]: https://www.intel.com/content/www/us/en/products/details/nuc.html
[^asrock-a300]: https://www.asrock.com/nettop/AMD/DeskMini%20A300%20Series/index.asp
[^asrock-a310]: https://www.asrock.com/nettop/Intel/DeskMini%20310%20Series/index.asp
[^lenovo-m]: https://www.lenovo.com/il/en/desktops-and-all-in-ones/thinkcentre/m-series-tiny/c/M-Series-Tiny
[^hp-elite-desk]: https://support.hp.com/us-en/document/c04816235
[^qnap]: https://www.qnap.com/en/product/tr-004
[^livebox-openwrt]: https://github.com/ubune/openwrt-livebox