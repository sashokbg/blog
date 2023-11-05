---
layout: post
title:  "Making a Cloud at Home - Part 1: Hardware"
date:   2023-09-23 13:38:56
categories: informatics
---

# Clouds are For Everyone

We have all heard of the "cloud" even outside the circle of IT specialists and it was surely in the context of a GAFA company.
It feels like a marketing stunt to make everyone think about the cloud as being something exclusively provided by those big corporations.
My goal was to gain a bit of independence in such a corporate-ruled world and have a tiny cloud of my own here at home.

I will try to keep the scope of this article only on the technical part and leave all the "freedom vs big corporation" part out of it.

So with no further ado let's make it rain !

## Defining the Needs

When we talk about a cloud we can mean many things. Starting from the *end-user* apps like iCloud, Google Drive, Drop Box and so on, to developer specific IaaS[^IaaS] and PaaS[^PaaS] like AWS, GCP and Azure.
So to make it clear what I wanted to accomplish, I composed a list of requirements for my home cloud that looked something like so:

- Have a user-friendly file managing interface similar to Google drive.
- Host multiple static websites such as a blog or portfolio with various domains (for me and my girl-fiend)
- Have a reliable storage with some level of redundancy (not aiming to equal Google Drive nor Dropbox of course).
- Perform regular backups to an outside platform.
- Make everything "as code" being able to reproduce / reinstall at will.

## Hardware

Let's first start with the hardware part of things. I have decided to create a Kubernetes cluster at home on bare metal machines which would give me much flexibility on scaling, running containers and having tons of online resources to use such as operators and such.
Kubernetes is also very mature at this point and becoming a standard in the cloud and is even the driving force behind "Cloud Native Computing"[^cloud-native].

To run a Kubernetes cluster however is not a trivial task and I had to make lots of compromises that, many would argue are just plain bad practices. One such is that my control plane and worker plane overlap partially and that the control plane is not in highly available.. but I am getting ahead of myself.

### Choosing the Right Hardware

I needed in theory at-least 2 machines to be able to call my cluster a cluster. My initial idea was to use Raspberry Pis since I had read somewhere that Canonical (the company that makes Ubuntu) had released a special and optimized version of K8 for ARM and PI in particular, called *microk8s*. \
The Raspberry Pi seemed to fit perfectly my needs: being small, with lowe power consumption and affordable.

This was all fine except that the last bit had completely changed since I last bought a Pi in 2017. After the pandemic hit most of the Pi 4s were bought by scalpers and I was unable to find a 8Gi Pi for less than 200 euros in France!
When I saw that ridiculous price, I started opening my eyes and realizing that the Raspi had other issues big issues such as: \
Bad power supply, SD card storage, no SATA or M.2 socket.

The "quick and easy" decision turned out to be nothing of the sort.

### Back to x86

After a quick search on the local "second hand" websites, I found out that there a lots of mini PC's such as the Lenovo ThinkCenter M Series, HP ELITEDESK 800 G2 DM[^hp-elite-desk], Intel NUC[^intel-nuc] or my favorite Asrock DeskMini (bare-bone).

All of the above mentioned have a Mini STX form factor of just 14 by 15 centimeters, low energy consumption of 35 to 65 Watts and a full blown x86/AMD64 architecture with real SATA 3 hard drives, M.2 SSD slots 8 or 16 Gi of Ram and so on. All of these specs just blow away the Raspberry Pi in terms of dollar-to-compute ratio.

So to keep things short for you, I bought 2 bare-bone PCs from Asrock - DeskMini A300 (AMD Ryzen)[^asrock-a300] and a 310 (Intel i5 9th gen)[^asrock-a310] with one Lenovo M Series[^lenovo-m]. \
I previously also had an HP EliteDesk but I ended up damaging it while opening / closing and this is one of the reasons I prefer the Asrock DeskMini's since they have a little bit more room inside as well as 2 HDD's and feel more robust in general.
Each of the Mini PCs was second-hand and refurbished and cost me around 200 to 220 euros, 

### Storage

As for the storage I immediately thought of a Network Accessed Storage (NAS) such as Synology or QNap. Since I was building my own cloud, I did't need any extra features that the NAS offers except for RAID storage and redundancy. 

So the cheapest and most adapted NAS for my needs seemed to be the QNap TR-004[^qnap] which is actually not a **N**AS since there is no **N**etwork part in it but a **D**AS - **D**irect Attached Storage.
It is actually hooked up to a PC using a fast USB-C 3.1 cable.

The rest of the storage is each of the machine's own SSD drives that are used for running the cluster's software. Only the DAS storage is used for user data and backups (more on that in the next chapter).

As of the hard drives inside tha DAS, I used a recommended "NAS friendly" drive from Western Digital - WD Red. I bought 3 drives of 2TiB for the 4 slots of the drive since I was short on money at the time of working on this project. \
Configuring for RAID 5 gave me a total of 4TiB of usable space and a 1 drive failure tolerance. As I said back in the beginning of the article - I do not aim to be Google-level of data integrity so this was just fine for me.

*SIDE NOTE:* The WD Red drives are supposed to be optimized for NAS usage whatever that means, but I had the unfortunate luck to get a disk failure on one of the disks only after 1 year in service. The disk was completely unreadable and I had to replace it as part of the manufacturer's guarantee which took more than 3 weeks and lots of calls after they just "forgot" about my case.

### Networking

For the network I used the great TP-Link ARcher 1750. One of the choosing factors was that it is supported by OpenWRT. OpenWRT is a Linux based router OS that allows you to take full control of your device and configure virtually everything. There also numerous plugins written for OpenWRT that can be installed with a single click etc. All of this is a subject for another post I guess.

One of the big features of using OpenWRT (besides being Open Source and Free) is that it can replace my ISP's provided box. There is a tutorial on GitHub[^orange-openwrt] that allowed me to replace my Orange Box with the TP-Link.

## How it Looks
![The Home Cloud](/assets/images/homecloud/home_cloud.jpg)

## A Step Back

Let's reflect for a minute on why all of this instead of a Synology ? \
Synology and QNAP NASes provide a big part of all the functions I wanted. Some of the more advanced pieces of hardware can even run containers opening the door for even more freedom.

My problem with these "commercial" solutions however is that they have a low "bang-for-buck" ratio - slow CPUs, little memory etc.

Also I wanted to reuse some old hardware and give it a new life instead of just buying something new. I am not a particularly "green" person, but even I agree that e-waste is a big issue and I get frustrated at how much good computers get thrown away for nothing. 

Lastly, if I did use an "out of the box" solution I would have learned little-to-nothing about how hard, but also fun, it is to host your own things. And this last bit is a true game changer! Taking this journey actually helped me advance my career and become a DevOps engineer besides being a Web Developer !

*END OF PART 1 of 3*

## Notes and References

[^IaaS]: https://www.redhat.com/en/topics/cloud-computing/what-is-iaas
[^PaaS]: https://www.redhat.com/en/topics/cloud-computing/what-is-paas
[^cloud-native]: https://www.cncf.io/about/who-we-are/
[^intel-nuc]: https://www.intel.com/content/www/us/en/products/details/nuc.html
[^asrock-a300]: https://www.asrock.com/nettop/AMD/DeskMini%20A300%20Series/index.asp
[^asrock-a310]: https://www.lenovo.com/il/en/desktops-and-all-in-ones/thinkcentre/m-series-tiny/c/M-Series-Tiny
[^lenovo-m]: https://www.lenovo.com/il/en/desktops-and-all-in-ones/thinkcentre/m-series-tiny/c/M-Series-Tiny
[^hp-elite-desk]: https://support.hp.com/us-en/document/c04816235
[^qnap]: https://www.qnap.com/en/product/tr-004
https://github.com/ubune/openwrt-livebox