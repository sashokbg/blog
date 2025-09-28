---
title:  "Teaching Git with Use-cases"
date:   2023-09-23
authors:
  - kirilov
categories: 
  - informatics
---
# Teaching Git With Use Cases

I have worked with many junior team members over the past years and tried to help them get better on their job and also make sure the project we work on stays clean and neat. Sometimes I needed to explain architecture layers, sometimes dependency injection, other times code and framework specifics and so on.

<!-- more -->

There was, however, one thing that kept coming every time, and that seemed to affect many junior and even confirmed profiles, and this was **Git usage**.

I found myself explaining how to properly use Git, and Gitflow more often than any other topic.
I covered various subjects ranging from "what a good commit message is" and "branch management" to more complicated things like "rebasing." Of course, there were also the inevitable "Oh Shit Git !" moments where someone would just break something and call for help.

Lacking knowledge, developers on my team would shy away from any advanced feature different from the basic "push / pull" operations.  
Many of the junior colleagues would even tell me that _rebase_ is actually a *bad* thing, and it should never be used when in fact it is one of the most powerful tools Git posses.[^linus-rant]

Colleagues would often not understand how Git worked and would use GUI (I am looking at you Git Kraken, you did worse than good in this world !! 😄)
to simplify their tasks. The problem is, however, that behind the pretty buttons there is a lot that can happen and many things can go wrong.
Using a distributed system such as Git and having a large code base comes with an inherent complexity, and there is no way around it.   

Even with a very well-thought UX GUI program like Kraken we can only get thus far, and at one point the aid it provides starts working against us. This isn't one of these situations where "there is an easier way to do things" where we just need to "use a better tool".  
The only way to really master such a complex tool like Git and profit from its value is to roll your sleeves and get in the dirt.

## Getting Dirty
I found by personal experience that one of the best ways to learn Git is to open the hood and check how it works. With this better understanding of how it stores data, what _blobs_, _commits_, _trees_ and _branches_[^git-internals] are, most of the black magic becomes at least understandable. As soon as I explain that branches, tags and the dreaded HEAD are only pointers to a given node in a large tree (graph) of commits then many operations like "reset", "rebase" and "checkout" start to make sense.

The following is one of the most useful scripts I used while explaining what's under the hood. It will list all directories and files in the _.git_ directory and will then invoke _git cat-file_ to show how git sees and stores data.

```shell
for obj in $(find .git/objects -type f | sed -E 's|\.git/objects/(.{2})/(.*)|\1\2|g'); do git cat-file -p $obj; echo "----"; done;
```

This theoretical lesson was very appreciated by most of my colleagues and all of them ended up with a better understanding of how things worked, but at the end of the
day it was still only _theoretical_. If I was to teach Git properly, I had to follow my philosophy of getting one's hands dirty.
What better way to do this than to exercise in real-life scenarios ?

## Git Scenarios

So I started writing and collecting use cases written in a simple almost BDD-style way.
Everytime I encountered a version control problem while working on a project, I would write the use case it leads to it.  

An example of one such use case related to fast-forwarding:

    I finished working on my feature
    And I want to merge my code to main
    But I do not want to generate a merge commit In order to keep history clean and linear

Or another one treating the dreaded detached state (this thing is the stuff of nightmares for many juniors, I can tell you 😄!)

    I did a wrong checkout And now my HEAD is in "detached" state

I added more and more use cases to the list and also asked friends to help me with ideas until I ended up with 20-ish use cases of various nature and complexity.

My next thought was that to get dirtier, we needed a proper sandbox playground.

## Sandbox

At first, I created a shell script that would create a local repository and configure it as a remote. It turns out Git would happily work with the _file://_ local protocol[^git-protocols].

```shell
mkdir -p workspace/use-case-repo.git
git init --initial-branch "main" --bare workspace/use-case-repo.git

git clone workspace/use-case-repo.git workspace/exercise
cd workspace/exercies
```

Having this basic script I could then create a shell script that will prepare our use case requirements.

Let's see the example of the detached HEAD:

```shell
# call the previous script to create a repo
init_repo

# add some commits
echo "content" > file1.txt
git add .
git commit -m "first commit"

echo "content2" > file2.txt
git add .
git commit -m "second commit"

# move head to a commit instead of a branch
git checkout HEAD~1
```

And voilà our scenario can be run, and we can redo the exercise as many times as we wish.  
I just needed to add one shell script that prepares and initializes each use case.

## Fake Editor

While writing the scripts for the "git rebase" use case, I ran into one issue related to the interactive editor that Git runs (usually vim or nano) during rebasing.  
I needed to be able to do interactive rebases and simulate how a developer would make a wrong choice.

Fortunately, it turned out git has two environment variables that we can use. *GIT_SEQUENCE_EDITOR* and *GIT_EDITOR* that deserve a separate post explaining exactly how they work.

For now, we can simplify things and just run the following snippet and expect the second commit to be squashed and then "fake_editor.sh" will be called for writing the squash message.

```shell
GIT_SEQUENCE_EDITOR="sed -i '2s/^pick/squash/g'" \
  GIT_EDITOR="./fake_editor.sh" \
  git rebase -i HEAD~2 
```

## Sandbox in a Containers
Sandbox works fine locally, but I encountered issues with some environments having old version of Git where some of the commands had different syntax and so on.
Containers would easily solve this problem, so I wrote a quick Dockerfile that uses alpine and installs _git_, _vim_ and _zsh_.  
Running the dockerfile in interactive mode will allow everyone to enjoy the same environment where everything works.

## Putting it all together

All the use-cases and related scripts can be found at my Git repository [https://github.com/sashokbg/git-training-usecases](https://github.com/sashokbg/git-training-usecases).

## Notes and References
An interesting thing to note is that I have started using version control systems such as CVS and SVN.
I, as well as many colleagues at the time, had big problems with the mental model of Git and distributed VCS.  
This is why I thought that nowadays junior members would be way better at using git since they didn't have to un-learn the bad practices that I had learned before.  
Unfortunately this does not seem to be the case, and I have no idea why. It may be related to the over extended usage of GUI tools or the increased pace of software development where people never have the time to sit and master their tools.

[^linus-rant]: Check Linus' rant on the topic of merging [https://www.phoronix.com/news/Linus-Torvalds-Git-Merge-Wisdom](https://www.phoronix.com/news/Linus-Torvalds-Git-Merge-Wisdom)

[^git-protocols]: Read more on Git protocols here [https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols )

[^git-internals]: Git internals [https://git-scm.com/book/en/v2/Git-Internals-Git-Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)

    Also a great video series: [https://www.youtube.com/watch?v=MyvyqdQ3OjI&list=PL9lx0DXCC4BNUby5H58y6s2TQVLadV8v7&index=2](https://www.youtube.com/watch?v=MyvyqdQ3OjI&list=PL9lx0DXCC4BNUby5H58y6s2TQVLadV8v7&index=2)

