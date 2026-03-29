# Probability

## The Basics

Before defining probability itself, it is necessary to define its scaffold. Conducting an experiment, which can be anything which is repeatable (winning a case in courtroom is not a repeatable experiment), yields us an outcome. A set containing all these outcomes is known as the *Sample space* and any subset of this set is called an *event.* An event has outcomes which are represented as points in a Venn diagram. 

There may exist discrete (there can be one-to-one correspondence to integers) or non-discrete (not one-to-one, example, the sample space of all real numbers between 0 to 1 cannot have a correspondence with the integers since $n(I) < n(R)$, finite (rolling a dice) or infinite (flipping a coin till tails pop up) sample spaces.

All the outcomes are assigned a weight $w_i$ such that

$$
\sum_i^{n} w_i = 1 
$$

where $n = n(S), S$ being the sample space.

The probability of an outcome occurring is thus defined as $w_i$. Note that none of this implies that an outcome with more probability is more likely to occur, since this description is abstract at best. We can only look at the likelihood of events occurring upon execution. However when we turn to large numbers it is easier to see that probabilities have a correspondence with likelihood, and thus we proceed with this conjecture throughout the subject. 

The *factorial* is the number of ways of arranging a number of distinct objects $n.$ Since the number of ways to arrange a number of identical objects is just 1. 

$$
n! = n\times(n-1)\times(n-2)...2\times 1 
$$

The number of ways of arranging $r$  distinct objects into $n$ distinct places without repetition where $r \leq n$  is known as the *permutation*. Note that the number of ways of arranging $n$ distinct objects into $n$ identical places is $1$ where as the number of ways of arranging $r$ identical objects into $n$ distinct places is known as the *combination.* 

$$
P_r^n = \frac{n!}{(n-r)!} = n \times (n-1) . ... (n - r +1)
$$

A combination can be turned into a permutation by using the multiplication principle and multiplying the combination by $r!$, and thus must be equal to the permutation divided by the factor $r!$. We can think of this as *choosing* r places out of n. Do remember that the places are distinct in this case. 

Stirling’s approximation states that for large $n$ the factorial is approximated as 

$$
n! = n^ne^{-n}\sqrt{2\pi n}
$$

**De Mere’s Paradox:** The probability (or the likelihood) of rolling a 7 is greater than rolling a 6 with two dice. The probability of rolling a 11 is greater than rolling a 12 with three dice. 

> 💡 **The Car Goat Problem**  Suppose there are three doors, behind two of the doors lie a goat, whereas behind one of the doors lie a car. The host opens a second door revealing a goat behind it. Assuming you want the car, is it in your favor to switch the door after opening it?

***Solution:*** Assuming we switch the door, then let an event be given as $(u,v,w,x)$  where $u$ = label of door chosen, $v$ = door opened by host, $w$ = label of door switched to, $x$ = W/L. Say the label of the door with the car is $1$, and the rest to the others. Note that the rule states that the goat must be behind the door opened by host. 

$$
S = (1, 2, 3, L), (1,3,2,L), (2,3,1,W), (3,2,1,W)
$$

The probability of choosing $1, 2,3$  is equally likely. Thus the probability of winning is simply $2/3$. The probability of $S[1], S[2]$ doesn’t matter.

If we didn’t switch the door, we would have a solid $1/3$  probability of winning. Thus, switching the door is better. $\square$

> 💡 A batch of 100 manufactured items is checked by an inspector, who examines 10 items selected at random. If none of the 10 items is defective, he accepts the whole batch. Otherwise, the batch is subjected to further inspection. What is the probability that a batch containing 10 defective items will be accepted?

***Solution*** First select at random any 10 objects from 100, total cases = $C_{10}^{100}$. Now, for all of these to be non-defective, they should belong to the 90 non-defective pieces. Total number of cases in which they do belong to the 90 non-defective pieces is $C_{10}^{90}$. Thus the overall probability is 

$$
\frac{C_{10}^{90}}{C_{10}^{100}} = 0.33047....
$$

Which is indeed pretty high. Note that by checking more of these things the probability will become lower, thus to maintain a decent quality control its sufficient to check only a portion of these, though not as low as 10. $\square$

> 💡 What is the probability that in a room of r people, at least two have the same birthday?

***Solution*** The total number of possible lists is $365^r$ . Now we may instead consider the probability of all people having different birthdays. Thus the total number of lists in which all people have different birthdays is given by 

$$
365\times 364 ... (365 - r + 1)
$$

And hence the probability of all people having different birthdays is 

$$
P(A^C) = \frac{365!}{(r!)365^n} = \left(1-\frac{1}{365}\right)\left(1-\frac{2}{365}\right)...\left(1-\frac{r-1}{365}\right)
$$

Hence the probability of two people having the same birthdays is given as 

$$
P(A) = 1 - P(A^C) = 1 - \left(1-\frac{1}{365}\right)\left(1-\frac{2}{365}\right)...\left(1-\frac{r-1}{365}\right)
$$

as r increases, the probability also becomes closer to one. This is the required expression. For 50 people in the room, the probability is $0.97$! $\square$

## Conditional Probability

There exists a (simple) formula for calculation of probabilities for the union of two events, and is given by 

$$
P(A\cup B) = P(A) + P(B) - P(A\cap B)
$$

Easy enough. The term $P(A\cup B)$  represents that either A occurs, or either B occurs. Whereas the term $P(A \cap B)$ represents probability of both A and B occurring simultaneously. $P(A-B)$ represents A occurs but not B, and $P(A|B)$  is the probability that A occurs given B occurs. 

Now consider *conditional probabilities* that is probability of event A occurring, given information about the result of event B.  It is given as $P(A/B)$. And has the given formula

$$
P(A/B) = \frac{P(A\cap B)}{P(B)} = \frac{n(A\cap B)}{n(B)} \implies P(B)P(A|B) = P(A\cap B)
$$

Note that these probabilities are defined on the original sample space only. A nice interpretation is given when we notice $P(A\cap B)$  gives events which are in both A and B, since given B it is only reasonable to expect outcomes not in B cannot occur. Thus the sample space is reduced to that of B, and essentially what this formula does is picks up elements in A from the final sample space of B, whose cardinality is given as $n(A\cap B)$ and divides by the cardinality of the new sample space B $n(B)$.

The total probability theorem states, that the probability of an event A occurring, is given by, if the events $B_i$ are independent of each other, and A is a subset of union of all $B_i$. 

$$
P(A ) = P(A|B_1) P(B_1) +P(A|B_2)P(B_2) +  ... + P(A|B_n)P(B_n) = \sum^n P(A\cap B_i)
$$

> 💡 **Does the king have a Sister?** A king has a sibling, what is the probability the sibling is a queen?

***Solution*** The sample space, given the information that $(G,G)$  is not possible, is given as 

$$
S = (B,B),(B,G),(G,B)
$$

Hence the probability is $2/3$. $\square$

> 💡 **Prisoner’s Dilemma** Consider three prisoners, A, B, and C. Two of the prisoners are to be released, and the prisoners know this, but not the identities of the two. Prisoner A asks the guard to tell him the identity of one prisoner other than himself who is to be released. The guard refuses and explains himself by saying to prisoner A, "your probability of being released is now 2/3. If I tell you that B, say, is to be released, then you would be one of only two prisoners whose fate is unknown and your probability of release would consequently decrease to 1/2. Since I don't want to hurt your chances for release I am not going to tell you." Is the guard correct in his reasoning?

***Solution*** The first statement is trivial, and correct. For the second statement, we require the information about what the guard says in the sample space, which lacks in the first scenario. 

Noting that the guard doesn’t give any information about whether A will be released or B will be released, the third column has only two options. Thus the new sample space is given as 

$$
O_1 = (A,B,B) \\ 
O_2 = (A,C,C) \\
O_3 = (B,C,B) \\
O_4 = (B,C,C) 
$$

Note that these are unordered outcomes (idk this software doesn’t allow for {} things). The space might seem weird at first, but note that if $O_1$ is true then C cannot be released, and similar for second. Now, $P(O_1) = 1/3$ similarly  $P(O_2) = 1/3$. Where as $P(O_3 \cup O_4) = 1/3$, since we know that union of $O_3,O_4$ yields the outcome $(B,C)$ which is known to be uniform and hence $1/3$. However we don’t know the individual outcomes.

The problem asks us to determine the value of 

$$
\frac{P(\ce{A is released})}{P(\ce{Guard says B is released})}
$$

which is equivalent to if Guard said otherwise. By using conditional probability, 

$$
\frac{P(\ce{A is released})}{P(\ce{Guard says B is released})} = \frac{P(O_1)}{P(\ce{Guard says B is released})} = \frac{1/3}{1/3 + k}
$$

Here $k$  can range anywhere from $[0,1/3]$ hence the probability after guard reveals the information can lie anywhere between $[1/2, 1]$. $\square$

## Bayes Theorem

The bayes theorem states that 

$$
P(A|B) = \frac{P(B|A)P(A)}{P(B|A)P(A) + P(B|A^C)P(A^C)} 
$$

In general the formula states

$$
P(B_i|A) = \frac{P(B_i)P(A|B_i)}{P(A)}
$$

**Proof** Consider the following 

$$
P(B|A) = \frac{P(A\cap B)}{P(A)} \implies P(B|A)P(A) = P(A\cap B)
$$

Similarly 

$$
P(B|A^C) = \frac{P(A^C\cap B)}{P(A^C)} \implies P(B|A^C)P(A^C) = P(A^C\cap B)
$$

But 

$$
P(A^C\cap B) + P(A\cap B) = P(B)
$$

Hence proved.

The proof of this formula however doesn’t enlighten us much. The underlying essence of Bayes theorem is that new information should work to update our believes and not completely change it. 

First of all, notice that Bayes theorem works to find out the probability of A, given B is true. Consider for example, we want to find the probability of a person being a farmer or a librarian, given he is meek and tidy. That is, we want to find the probability that the hypothesis is true, given the evidence, $P(H|E)$. 

![Untitled](Untitled.png)

Consider the given figure. Here, $P(H)$ (known as the prior) is the probability of a random person being a librarian, that is the probability of our hypothesis being true, since we have *hypothesized* that the person is a librarian. Also, $P(\neg H)$ is the probability of a person being a farmer ($P(\neg A) = P(A^C)$). Given more information (the person being meek and tidy), that is given more *evidence* we can say that the probability that given the evidence the hypothesis is true is given as $P(E|H)$. This essentially is the proportion of librarians that are meek and tidy. 

Thus the number of farmers, is given as

$$
A_1 = P(E|H)P(H)
$$

Similarly, the number of farmers that are meek and tidy is given as 

$$
A_2 = P(E|\neg H)P(\neg H)
$$

Hence, the total number of people that fit the description, is the sum of the areas 

$$
A_1 + A_2 \implies P(H|E) = \frac{A_1}{A_1 + A_2} = \frac{P(H\cap E)}{P(E)}
$$

And the ratio of areas essentially gives us the desired probability. Stepping back, we have obtained the ratio of librarians fitting the evidence, to the total number of librarians and farmers fitting the evidence, which corresponds to the number of people fitting the hypothesis and the evidence to the total number of people fitting the evidence, which is indeed our desired probability.

An extremely important problem to understand the Bayes theorem is as follows: 

> 💡 Consider a cannabis test. If tested on a cannabis user, it gives positive test 90% of the time. If tested on a non-cannabis user, it gives a false positive 20% of the time. If the prevalence of cannabis use in a given sample set is 1 in 20, find the probability that a random person from the sample is a cannabis user given that they tested positive.

***Solution*** A very important thing to note is the probability of a random person being tested. Understanding this easily solves the problem. Note that in a given population, there being some amount of users, and some amount of non-users, the probability of each of those being tested positive is not equal, and thus leads to some imbalance for a random person being tested turning out positive. 

That is, the probability of the people being tested positive is proportionate to their prevalence. The probability of a person being tested randomly on the street, and turning out positive is:

$$
P(\ce{Positive}|\ce{User})P(\ce{User}) + P(\ce{Positive}|\neg \ce{User})P(\neg \ce{User})
$$

In this case, the value turns out to be

$$
0.9\times 0.05 + 0.2\times 0.95 = 0.235
$$

Imagine the population consisted only of non-cannabis users, then it would have been given as 

$$
0.2\times 0.05 + 0.2\times 0.95 = 0.2
$$

Now, given the nature of the test, if a person was a cannabis user, the probability of them being tested positive increases, and hence increases the overall probability of a random person being detected positive. Note that this DOES NOT increase the probability of an individual non-user being detected positive, nor does it decrease the probability of a individual user being detected positive, because that data is characteristic of a test, we are really just speaking of a general population, and probabilities inside it. 

Hence, we have to add an extra term of $\Delta P(\ce{Positive}) \times \ce{User} = 0.7 \times 0.05 = 0.035$, thus contributing to an extra factor. Now, if we want to find the probability of a random user being a cannabis user from a general population, we can just divide the given probability by the probability of a user being detected positive from a general population, which is given as $P(\ce{Positive|User})P(\ce{User}) = 0.9\times 0.05$.

Hence, the overall probability is given as $19.14$%. 

Again, it is instructive to think of areas. The problem becomes very simple when we draw a square and consider the number of people being tested false positive, number of people being tested true positive, and then just using, which is much much better. $\square$

$$
\frac{\ce{True Positive}}{\ce{True Postive} + \ce{False Positive }}  
$$

> 💡 An urn contains two balls, each of which can be white or black. We will select balls repeatedly from the urn with replacement according to the following procedure: mix well, select a ball, note its color, replace ball in urn, mix well, select a ball, and so on. Suppose the first two selections yield white balls. Find the probability of a white ball at the third selection.

***Solution 1*** Before any sampling, the probability of both black = both white = $1/4$. Define the events as: 

$$
D = \ce{Different colors} \\
W = \ce{Both white} \\
B = \ce{Both Black} \\
W2 = \ce{First two yield white balls} \\
C = \ce{Ball is white at third selection}
$$

First, remember we need to find the probability that the third ball is *white* given the evidence that the *first two were white.* This is equal to:

$$
P(C|W2) = \frac{P(W2|C)}{P(W2)}
$$

In words, the probability that the first two are white, given the third is white divided by the probability that the first two are white. 

$$
P(W2) = P(W2|D)P(D) + P(W2|W)P(W) + P(W2|B)P(B) = (1/4)(1/2) + 1(1/4) + 0(1/4) = 3/8 
$$

Now, the probability of first two being white, and the third being white can be calculated by listing all the combinations, or using, where the third term is obviously 0.

$$
P(C\cap W2) = P(C\cap W2 \cap D) + P(C \cap W2 \cap W) + P(C\cap W2 \cap B)
$$

By using conditional probabilities, 

$$
P(C\cap W2) = P(C \cap W2 | D)P(D) + P(C \cap W2 | W)P(W) + 0 = (1/8)(1/2) + 1(1/4) = 5/16 
$$

Thus the answer becomes straightforward now and is $\frac{5/16}{3/8} = \frac{5}{6}$  which is pretty damn high. $\square$

***Solution 2*** Using the same notation as before, but this time by Bayes theorem, and by using the same intuition as areas, we obtain

$$
P(D|W2) = \frac{P(W2|D)P(D)}{P(W2|D)P(D) + P(W2|W)P(W) + P(W2|B)P(B)}
$$

Plugging in we find $P(D|W2) = 1/3$. Hence $P(W|W2) = 2/3$. Using this updated probability distribution, we can go as usual and find the probability C given the new probabilities of B,W,D.  $\square$ 

$$
P^*(C) = P^* (D)P^*(C|D) +P^*(W)P^*(C|W) = 1/3/ \times 1/2 + 2/3\times 1 = 5/6
$$

## Subjective Probability

The name just implies that the probability depends on a information which is not really given. We can only make a estimates, or give some range to find the overall probability. 


> 💡 A man accused in a paternity case is found to have a genetic marker appearing in 1 percent of the adult male population. This genetic marker is found in the child and could only be transmitted to the child through his father, with the child 100 percent certain of acquiring the marker if the father has it. The question is to determine the probability that the man is the father, given that the child has the marker.

***Solution:*** Simply applying bayes theorem assuming $A = \ce{man is the father}, B = \ce{child has the marker }$ , 

$$
P(A|B) = \frac{P(B|A)*P(A)}{P(B|A)*P(A) + P(B|\neg A)*P(\neg A)} = \frac{1\times P(A)}{1\times P(A) + 0.01\times P(\neg A)} 
$$

Where, the probability now depends on the given value of P(A). $\square$

## Independence of Events

Consider a set of two events $H_1, H_2$. The two are considered independent if the outcome of the first does not affect the outcomes of the second. Mathematically speaking

$$
P(H_2|H_1) = P(H_2) = \frac{P(H_2 \cap H_1)}{P(H_1)} \\ \implies P(H_2 \cap H_1) = \ce{  P(H_1)P(H_2)  (Product Rule)}
$$

Events that do not satisfy the product rule are called dependent events. 

The product rule can be extended to a number of events that are independent, mathematically.

$$
P(H_1\cap H_2 \cap ... \cap H_n) = P(H_1)P(H_2)...P(H_n)
$$

The proof of this theorem is easily obtained inductively. 

## Problems

First of all let us deal with a HUGE (not hard) problem. 

> 💡 Consider a set of $m$ objects, all of different quality, such that it is always possible to tell which of a given pair of objects is better. Suppose the objects are presented one at a time and at random to an observer, who at each stage either selects the object, thereby designating it as "the best" and examining no more objects, or rejects the object once and for all and examines another one. (Of course, the observer may very well make the mistake of rejecting the best object in the vain hope of finding a better one!) For example, the observer may be a fussy young lady and the objects a succession of $m$ suitors. At each stage, she can either accept the suitor's proposal of marriage, thereby terminating the process of selecting a husband, or she may reject him (thereby losing him forever) and wait for a better prospect to come along. It will further be assumed that the observer adopts the following natural rule for selecting the best object: "Never select an object inferior to those previously rejected." Then the observer can select the first object and stop looking for a better one, or he can reject the first object and examine further objects one at a time until he finds one better than those previously examined. He can then select this object, thereby terminating the inspection process, or he can examine further objects in the hope of eventually finding a still better one, and so on. Of course, it is entirely possible that he will reject the very best object somewhere along the line, and hence never be able to make a selection at all. On the other hand, if the number of objects is large, almost anyone would reject the first object in the hope of eventually finding a better one. Now suppose the observer, following the above "decision rule," selects the $i^{th}$ inspected object once and for all, giving up further inspection. (The $i^{th}$ object must then be better than the $i - 1$ previously inspected objects). What is the probability that this ith object is actually the best of all m objects, both inspected and uninspected?


**Solution** Given the information, a good guess seems like $\frac{i}{m}$. Now, let us consider what the problem actually wants. We want to find the probability of the $i^{th}$ element being the best out of the $m$ elements (define it as $P(A)$ from a permutation of $m$ objects, a given object occupies the $i^{th}$ place), given it is the best of all the previous ones (define it as $P(B)$, a given object occupies the $i^{th}$ from permuation of $i$ elements)

Now 

$$
P(B) = \frac{(i-1)!}{i!} \\
P(A) = \frac{(m-1)!}{m!}
$$

We seek the conditional probability, that A is true given B has already occurred. 

$$
P(A|B) = \frac{P(A\cap B)}{P(B)}
$$

But $A \cap B = A$ . Hence the answer is just what we guessed. $\square$

$$
P(A|B) = \frac{i}{m} 
$$

> 💡 Consider the game of "heads or tails," in which a coin is tossed and a player wins 1 dollar, say, if he successfully calls the side of the coin which lands upward, but otherwise loses 1 dollar. Suppose the player's initial capital is x dollars, and he intends to play until he wins m dollars but no longer. In other words, suppose the game continues until the player either wins the amount of m dollars, stipulated in advance, or else loses all his capital and is "ruined." What is the probability that the player will be ruined?

**Solution** Note that this is the contrary of independent events. Say p(x) is the probability of ruin. The probability of ruin for $x+1$ capital is different than $x$ dollars, and the next probability depends on the one before it and so on.

$$
P(A|B_1) = p(x+1), P(A|B_2) = p(x-1)
$$

Where $B_1 = \ce{Win}, B_2 = \ce{Lose}$. 

Thus 

$$
p(A) = P(A|B_1)P(B_1) + P(A|B_2)P(B_2 
\implies p(x) = \frac{1}{2}\left(p(x+1) + p(x-1)\right)
$$

Now 

$$
p(0) = 1, p(m) = 0
$$

Solving the linear equation $p(x) = C_1 x + C_2$  with the initial conditions, we get 

$$
p(x) = 1 - \frac{x}{m} \square
$$